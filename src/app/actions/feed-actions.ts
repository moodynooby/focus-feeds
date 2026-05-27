"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import Parser from "rss-parser";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/simple-auth";
import type {
	FeedDuration,
	FetchFeedsResult,
	SimpleAuthResult,
	SyncFeedsResult,
	UserFeedResult,
} from "@/types";

interface FetchError extends Error {
	code?: string;
}

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRIES = 3;

async function fetchFeedWithRetry(
	parser: Parser,
	url: string,
	maxRetries = DEFAULT_RETRIES,
	timeout = DEFAULT_TIMEOUT,
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

interface ParsedFeedItem {
	title: string;
	link: string;
	pubDate: string;
	content: string;
	contentSnippet: string;
	guid: string;
	source: string;
	feedUrl: string;
	isPodcast: boolean;
	audioUrl: string | null;
	audioType: string | null;
	duration: string | null;
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

		const allItems: ParsedFeedItem[] = [];
		const failedFeeds: Array<{ url: string; error: string }> = [];

		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const feedUrl = urls[i] ?? "";
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
							feedUrl,
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
					url: feedUrl,
					error: errorMsg,
				});
				console.error(
					`Feed failed [${feedUrl}]:`,
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

		const finalUrls: string[] = [];
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
			finalUrls.push(...validLocalUrls);
		} else if (mergeStrategy === "pull") {
			finalUrls.push(...existingUrls);
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

			finalUrls.push(...new Set([...validLocalUrls, ...existingUrls]));
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
