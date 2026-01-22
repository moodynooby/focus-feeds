"use server";

import Parser from "rss-parser";
import { auth } from "./auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchFeeds(urls, duration = "week") {
  const parser = new Parser();

  // Validate input
  if (!urls || urls.length === 0) {
    return {
      success: false,
      error: "No feed URLs provided",
      items: [],
    };
  }

  // Calculate cutoff date
  let cutoffDate = null;
  const now = new Date();
  if (duration === "today") {
    cutoffDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (duration === "week") {
    cutoffDate = new Date(now.setDate(now.getDate() - 7));
  } else if (duration === "month") {
    cutoffDate = new Date(now.setDate(now.getDate() - 30));
  }
  // "all" leaves cutoffDate as null

  try {
    const results = await Promise.allSettled(
      urls.map((url) => parser.parseURL(url)),
    );

    const allItems = [];
    const failedFeeds = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const feedItems = result.value.items
          .filter((item) => {
            if (!cutoffDate) return true;
            const itemDate = new Date(item.pubDate);
            return !isNaN(itemDate) && itemDate >= cutoffDate;
          })
          .map((item) => {
            // Explicitly extract primitive values to ensure serializability
            const mapped = {
              title: String(item.title || ""),
              link: String(item.link || ""),
              pubDate: String(item.pubDate || ""),
              content: String(item.content || item.contentSnippet || ""),
              contentSnippet: String(item.contentSnippet || ""),
              guid: String(item.guid || ""),
              source: String(result.value.title || "Unknown Source"),
              feedUrl: String(urls[index]),
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
        failedFeeds.push({
          url: urls[index],
          error: result.reason?.message || "Unknown error",
        });
        console.error(`Feed failed [${urls[index]}]:`, result.reason);
      }
    });

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

export async function getUserFeeds() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const feeds = await prisma.feed.findMany({
      where: { userId: session.user.id },
      select: { url: true, id: true },
    });
    return { success: true, feeds };
  } catch (error) {
    console.error("Failed to get user feeds:", error);
    return { success: false, error: "Failed to load feeds" };
  }
}

export async function addUserFeed(url) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!url) {
    return { success: false, error: "URL is required" };
  }

  try {
    await prisma.feed.create({
      data: {
        url,
        userId: session.user.id,
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add feed:", error);
    if (error.code === "P2002") {
      // Unique constraint
      return { success: false, error: "Feed already exists" };
    }
    return { success: false, error: "Failed to save feed" };
  }
}

export async function removeUserFeed(url) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // We remove by url + userId since we don't always track IDs in frontend state easily without refactor
    // But since (userId, url) is unique, this is safe.
    await prisma.feed.deleteMany({
      where: {
        userId: session.user.id,
        url: url,
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove feed:", error);
    return { success: false, error: "Failed to remove feed" };
  }
}

export async function syncFeeds(localUrls) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const userId = session.user.id;

    // 1. Get existing DB feeds
    const existingFeeds = await prisma.feed.findMany({
      where: { userId },
      select: { url: true },
    });
    const existingUrls = new Set(existingFeeds.map(f => f.url));

    // 2. Identify new feeds to add
    // Filter out null/undefined/empty strings just in case
    const validLocalUrls = (localUrls || []).filter(u => u && typeof u === 'string');
    const newUrls = validLocalUrls.filter(url => !existingUrls.has(url));

    // 3. Bulk create new feeds
    if (newUrls.length > 0) {
      await prisma.feed.createMany({
        data: newUrls.map(url => ({
          userId,
          url,
        })),
      });
    }

    // 4. Return updated full list
    const allFeeds = await prisma.feed.findMany({
      where: { userId },
      select: { url: true, id: true },
    });

    revalidatePath("/");
    return { success: true, feeds: allFeeds };
  } catch (error) {
    console.error("Failed to sync feeds:", error);
    return { success: false, error: "Failed to sync feeds" };
  }
}
