"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import Parser from "rss-parser";
import { sql } from "@/lib/db";
import {
	clearSession,
	getCurrentUser,
	getOrCreateUser,
	setSession,
} from "@/lib/simple-auth";

async function fetchFeedWithRetry(
	parser,
	url,
	maxRetries = 3,
	timeout = 15000,
) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const result = await parser.parseURL(url);
			clearTimeout(timeoutId);
			return { success: true, data: result };
		} catch (error) {
			clearTimeout(timeoutId);
			const isLastAttempt = attempt === maxRetries - 1;
			const isTimeout = error.name === "AbortError";
			const isNetworkError =
				error.code === "ECONNABORTED" ||
				error.code === "ECONNREFUSED" ||
				error.message?.includes("timeout") ||
				error.message?.includes("ECONNREFUSED");

			if (isLastAttempt || (!isNetworkError && !isTimeout)) {
				return { success: false, error, url };
			}

			const delay = Math.min(1000 * 2 ** attempt, 8000);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
	return { success: false, error: new Error("Max retries exceeded"), url };
}

async function fetchFeedsInternal(urls, duration = "week") {
	if (!urls || urls.length === 0) {
		return {
			success: false,
			error: "No feed URLs provided",
			items: [],
		};
	}

	let cutoffDate = null;
	const now = new Date();
	if (duration === "today") {
		cutoffDate = new Date(now.setHours(0, 0, 0, 0));
	} else if (duration === "week") {
		cutoffDate = new Date(now.setDate(now.getDate() - 7));
	} else if (duration === "month") {
		cutoffDate = new Date(now.setDate(now.getDate() - 30));
	}

	try {
		const parser = new Parser();
		const results = await Promise.allSettled(
			urls.map((url) => fetchFeedWithRetry(parser, url)),
		);

		const allItems = [];
		const failedFeeds = [];

		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			if (result.status === "fulfilled" && result.value.success) {
				const feedData = result.value.data;
				const feedItems = feedData.items
					.filter((item) => {
						if (!cutoffDate) return true;
						const itemDate = new Date(item.pubDate);
						return !Number.isNaN(itemDate) && itemDate >= cutoffDate;
					})
					.map((item) => {
						const mapped = {
							title: String(item.title || ""),
							link: String(item.link || ""),
							pubDate: String(item.pubDate || ""),
							content: String(item.content || item.contentSnippet || ""),
							contentSnippet: String(item.contentSnippet || ""),
							guid: String(item.guid || ""),
							source: String(feedData.title || "Unknown Source"),
							feedUrl: String(urls[i]),
							isPodcast: Boolean(
								item.enclosure?.url &&
									item.enclosure?.type?.startsWith("audio/"),
							),
							audioUrl: item.enclosure?.url ? String(item.enclosure.url) : null,
							audioType: item.enclosure?.type
								? String(item.enclosure.type)
								: null,
							duration: item.itunes?.duration
								? String(item.itunes.duration)
								: null,
						};
						return mapped;
					});
				allItems.push(...feedItems);
			} else {
				const errorMsg =
					result.status === "fulfilled"
						? result.value.error?.message || "Unknown error"
						: result.reason?.message || "Unknown error";
				failedFeeds.push({
					url: urls[i],
					error: errorMsg,
				});
				console.error(
					`Feed failed [${urls[i]}]:`,
					result.status === "fulfilled" ? result.value.error : result.reason,
				);
			}
		}

		const sortedItems = allItems.sort(
			(a, b) => new Date(b.pubDate) - new Date(a.pubDate),
		);

		console.log("fetchFeeds success, returning", sortedItems.length, "items");

		return {
			success: true,
			items: sortedItems,
			failedFeeds: failedFeeds.length > 0 ? failedFeeds : null,
			timestamp: Date.now(),
		};
	} catch (error) {
		console.error("Unexpected error in fetchFeeds:", error);
		return {
			success: false,
			error: error.message || "Failed to fetch feeds",
			items: [],
		};
	}
}

export const fetchFeeds = unstable_cache(
	async (urls, duration = "week") => fetchFeedsInternal(urls, duration),
	["feeds"],
	{
		revalidate: 300,
		tags: ["rss-feeds"],
	},
);

export async function getUserFeeds() {
	const user = await getCurrentUser();
	if (!user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const feeds = await sql`
      SELECT id, url FROM "Feed"
      WHERE "userId" = ${user.id}
    `;
		return { success: true, feeds };
	} catch (error) {
		console.error("Failed to get user feeds:", error);
		return { success: false, error: "Failed to load feeds" };
	}
}

export async function addUserFeed(url) {
	const user = await getCurrentUser();
	if (!user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	if (!url) {
		return { success: false, error: "URL is required" };
	}

	try {
		await sql`
      INSERT INTO "Feed" (id, url, "userId", "createdAt")
      VALUES (gen_random_uuid(), ${url}, ${user.id}, NOW())
    `;
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Failed to add feed:", error);
		if (error.code === "23505") {
			return { success: false, error: "Feed already exists" };
		}
		return { success: false, error: "Failed to save feed" };
	}
}

export async function removeUserFeed(url) {
	const user = await getCurrentUser();
	if (!user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		await sql`
      DELETE FROM "Feed"
      WHERE "userId" = ${user.id} AND url = ${url}
    `;
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Failed to remove feed:", error);
		return { success: false, error: "Failed to remove feed" };
	}
}

export async function syncFeeds(localUrls, options = {}) {
	const user = await getCurrentUser();
	if (!user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const userId = user.id;
	const { mergeStrategy = "merge" } = options;

	try {
		const existingFeeds = await sql`
      SELECT url FROM "Feed"
      WHERE "userId" = ${userId}
    `;
		const existingUrls = new Set(existingFeeds.map((f) => f.url));

		const validLocalUrls = (localUrls || []).filter(
			(u) => u && typeof u === "string" && u.trim() !== "",
		);
		const localUrlsSet = new Set(validLocalUrls);

		let finalUrls = [];
		let addedToDb = [];
		let pulledFromDb = [];

		if (mergeStrategy === "push") {
			const urlsToDelete = [...existingUrls].filter(
				(url) => !localUrlsSet.has(url),
			);
			if (urlsToDelete.length > 0) {
				await sql`
          DELETE FROM "Feed"
          WHERE "userId" = ${userId}
          AND url = ANY(${urlsToDelete}::text[])
        `;
			}
			const newUrls = validLocalUrls.filter((url) => !existingUrls.has(url));
			if (newUrls.length > 0) {
				for (const url of newUrls) {
					await sql`
            INSERT INTO "Feed" (id, url, "userId", "createdAt")
            VALUES (gen_random_uuid(), ${url}, ${userId}, NOW())
            ON CONFLICT ("userId", url) DO NOTHING
          `;
				}
				addedToDb = newUrls;
			}
			finalUrls = validLocalUrls;
		} else if (mergeStrategy === "pull") {
			finalUrls = [...existingUrls];
			pulledFromDb = [...existingUrls];
		} else {
			const newUrls = validLocalUrls.filter((url) => !existingUrls.has(url));
			if (newUrls.length > 0) {
				for (const url of newUrls) {
					await sql`
            INSERT INTO "Feed" (id, url, "userId", "createdAt")
            VALUES (gen_random_uuid(), ${url}, ${userId}, NOW())
            ON CONFLICT ("userId", url) DO NOTHING
          `;
				}
				addedToDb = newUrls;
			}

			const serverOnlyUrls = [...existingUrls].filter(
				(url) => !localUrlsSet.has(url),
			);
			pulledFromDb = serverOnlyUrls;

			finalUrls = [...new Set([...validLocalUrls, ...existingUrls])];
		}

		const allFeeds = await sql`
      SELECT id, url FROM "Feed"
      WHERE "userId" = ${userId}
    `;

		revalidatePath("/");
		return {
			success: true,
			feeds: allFeeds,
			syncInfo: {
				addedToDb,
				pulledFromDb,
				localCount: validLocalUrls.length,
				serverCount: existingUrls.size,
				finalCount: finalUrls.length,
				strategy: mergeStrategy,
			},
		};
	} catch (error) {
		console.error("Failed to sync feeds:", error);
		return { success: false, error: "Failed to sync feeds" };
	}
}

export async function createOrGetUser(passphrase) {
	if (!passphrase || passphrase.trim() === "") {
		return { success: false, error: "Passphrase is required" };
	}

	if (passphrase.length < 4) {
		return {
			success: false,
			error: "Passphrase must be at least 4 characters",
		};
	}

	try {
		const user = await getOrCreateUser(passphrase);

		if (!user) {
			return { success: false, error: "Failed to create or get user" };
		}

		await setSession(user.id);

		return {
			success: true,
			user: {
				id: user.id,
				createdAt: user.createdAt,
			},
		};
	} catch (error) {
		console.error("Failed to create/get user:", error);
		return { success: false, error: "Failed to create account" };
	}
}

export async function checkAuth() {
	try {
		const user = await getCurrentUser();
		if (user) {
			return { authenticated: true, userId: user.id };
		}
		return { authenticated: false };
	} catch (error) {
		console.error("checkAuth error:", error);
		return { authenticated: false };
	}
}

export async function signOut() {
	try {
		await clearSession();
		return { success: true };
	} catch (error) {
		console.error("signOut error:", error);
		return { success: false, error: "Failed to sign out" };
	}
}
