"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import Parser from "rss-parser";
import {
	clearSession,
	getCurrentUser,
	getOrCreateUser,
	setSession,
} from "@/features/auth/lib/simple-auth";
import { sql } from "@/lib/db";
import type {
	AuthResult,
	CheckAuthResult,
	FailedFeed,
	FeedDuration,
	FeedItem,
	FetchFeedsResult,
	SimpleAuthResult,
	SyncFeedsResult,
	UserFeedResult,
} from "@/types";

export interface FetchFullArticleResult {
	title: string;
	content: string;
	excerpt: string;
	byline: string | null;
	siteName: string | null;
	length: number;
}

export async function fetchFullArticle(
	url: string,
): Promise<FetchFullArticleResult | { error: string }> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 15000);

		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (compatible; FocusFeeds/1.0; +https://focusfeeds.app)",
				Accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.5",
			},
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			return { error: `HTTP ${response.status}: ${response.statusText}` };
		}

		const html = await response.text();
		const { parseHTML } = await import("linkedom");
		const { Readability } = await import("@mozilla/readability");

		const { document } = parseHTML(html);
		const reader = new Readability(document);
		const article = reader.parse();

		if (!article) {
			return { error: "Could not extract article content" };
		}

		return {
			title: article.title || "",
			content: article.content || "",
			excerpt: article.excerpt || "",
			byline: article.byline || null,
			siteName: article.siteName || null,
			length: article.length || 0,
		};
	} catch (error) {
		const err = error as Error;
		if (err.name === "AbortError") {
			return { error: "Request timed out" };
		}
		console.error("fetchFullArticle error:", err);
		return { error: err.message || "Failed to fetch article" };
	}
}

interface FetchError extends Error {
	code?: string;
}

async function fetchFeedWithRetry(
	parser: Parser,
	url: string,
	maxRetries = 3,
	timeout = 15000,
): Promise<
	| { success: true; data: Parser.Output<Record<string, unknown>> }
	| { success: false; error: FetchError; url: string }
> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const result = await parser.parseURL(url);
			clearTimeout(timeoutId);
			return { success: true, data: result };
		} catch (error) {
			clearTimeout(timeoutId);
			const err = error as FetchError;
			const isLastAttempt = attempt === maxRetries - 1;
			const isTimeout = err.name === "AbortError";
			const isNetworkError =
				err.code === "ECONNABORTED" ||
				err.code === "ECONNREFUSED" ||
				err.message?.includes("timeout") ||
				err.message?.includes("ECONNREFUSED");

			if (isLastAttempt || (!isNetworkError && !isTimeout)) {
				return { success: false, error: err, url };
			}

			const delay = Math.min(1000 * 2 ** attempt, 8000);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
	return {
		success: false,
		error: new Error("Max retries exceeded") as FetchError,
		url,
	};
}

async function fetchFeedsInternal(
	urls: string[],
	duration: FeedDuration = "week",
): Promise<FetchFeedsResult> {
	if (!urls || urls.length === 0) {
		return {
			success: false,
			error: "No feed URLs provided",
			items: [] as FetchFeedsResult["items"],
		};
	}

	let cutoffDate: Date | null = null;
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

		const allItems: FeedItem[] = [];
		const failedFeeds: FailedFeed[] = [];

		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			if (result.status === "fulfilled" && result.value.success) {
				const feedData = result.value.data;
				const feedItems = feedData.items
					.filter((item: Record<string, unknown>) => {
						if (!cutoffDate) return true;
						const itemDate = new Date(item.pubDate as string);
						return !Number.isNaN(itemDate) && itemDate >= cutoffDate;
					})
					.map((item: Record<string, unknown>) => {
						const enclosure = item.enclosure as
							| Record<string, unknown>
							| undefined;
						const itunes = item.itunes as Record<string, unknown> | undefined;
						return {
							title: String(item.title || ""),
							link: String(item.link || ""),
							pubDate: String(item.pubDate || ""),
							content: String(item.content || item.contentSnippet || ""),
							contentSnippet: String(item.contentSnippet || ""),
							guid: String(item.guid || ""),
							source: String(feedData.title || "Unknown Source"),
							feedUrl: String(urls[i]),
							isPodcast: Boolean(
								enclosure?.url &&
									enclosure?.type?.toString().startsWith("audio/"),
							),
							audioUrl: enclosure?.url ? String(enclosure.url) : null,
							audioType: enclosure?.type ? String(enclosure.type) : null,
							duration: itunes?.duration ? String(itunes.duration) : null,
						};
					});
				allItems.push(...feedItems);
			} else {
				const errorMsg =
					result.status === "fulfilled"
						? (
								result.value as {
									success: false;
									error: FetchError;
									url: string;
								}
							).error?.message || "Unknown error"
						: (result.reason as Error)?.message || "Unknown error";
				failedFeeds.push({
					url: urls[i],
					error: errorMsg,
				});
				console.error(
					`Feed failed [${urls[i]}]:`,
					result.status === "fulfilled"
						? (
								result.value as {
									success: false;
									error: FetchError;
									url: string;
								}
							).error
						: result.reason,
				);
			}
		}

		const sortedItems = allItems.sort(
			(a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
		);

		console.log("fetchFeeds success, returning", sortedItems.length, "items");

		return {
			success: true,
			items: sortedItems,
			failedFeeds: failedFeeds.length > 0 ? failedFeeds : null,
			timestamp: Date.now(),
		};
	} catch (error) {
		const err = error as Error;
		console.error("Unexpected error in fetchFeeds:", error);
		return {
			success: false,
			error: err.message || "Failed to fetch feeds",
			items: [] as FetchFeedsResult["items"],
		};
	}
}

export const fetchFeeds = unstable_cache(
	async (urls: string[], duration: FeedDuration = "week") =>
		fetchFeedsInternal(urls, duration),
	["feeds"],
	{
		revalidate: 300,
		tags: ["rss-feeds"],
	},
);

export async function getUserFeeds(): Promise<UserFeedResult> {
	const user = await getCurrentUser();
	if (!user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const feeds = await sql`
      SELECT id, url FROM "Feed"
      WHERE "userId" = ${user.id}
    `;
		return {
			success: true,
			feeds: feeds as Array<{ id: string; url: string }>,
		};
	} catch (error) {
		console.error("Failed to get user feeds:", error);
		return { success: false, error: "Failed to load feeds" };
	}
}

export async function addUserFeed(url: string): Promise<SimpleAuthResult> {
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
		const err = error as { code?: string };
		console.error("Failed to add feed:", error);
		if (err.code === "23505") {
			return { success: false, error: "Feed already exists" };
		}
		return { success: false, error: "Failed to save feed" };
	}
}

export async function removeUserFeed(url: string): Promise<SimpleAuthResult> {
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

export async function syncFeeds(
	localUrls: string[],
	options: { mergeStrategy?: "merge" | "push" | "pull" } = {},
): Promise<SyncFeedsResult> {
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
		const existingUrls = new Set(
			(existingFeeds as Array<{ url: string }>).map((f) => f.url),
		);

		const validLocalUrls = (localUrls || []).filter(
			(u): u is string => typeof u === "string" && u.trim() !== "",
		);
		const localUrlsSet = new Set(validLocalUrls);

		let finalUrls: string[] = [];
		const addedToDb: string[] = [];
		const pulledFromDb: string[] = [];

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
				addedToDb.push(...newUrls);
			}
			finalUrls = validLocalUrls;
		} else if (mergeStrategy === "pull") {
			finalUrls = [...existingUrls];
			pulledFromDb.push(...existingUrls);
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
				addedToDb.push(...newUrls);
			}

			const serverOnlyUrls = [...existingUrls].filter(
				(url) => !localUrlsSet.has(url),
			);
			pulledFromDb.push(...serverOnlyUrls);

			finalUrls = [...new Set([...validLocalUrls, ...existingUrls])];
		}

		const allFeeds = await sql`
      SELECT id, url FROM "Feed"
      WHERE "userId" = ${userId}
    `;

		revalidatePath("/");
		return {
			success: true,
			feeds: allFeeds as Array<{ id: string; url: string }>,
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

export async function createOrGetUser(passphrase: string): Promise<AuthResult> {
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

export async function checkAuth(): Promise<CheckAuthResult> {
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

export async function signOut(): Promise<{ success: boolean; error?: string }> {
	try {
		await clearSession();
		return { success: true };
	} catch (error) {
		console.error("signOut error:", error);
		return { success: false, error: "Failed to sign out" };
	}
}
