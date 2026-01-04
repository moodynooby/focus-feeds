"use server";

import Parser from "rss-parser";

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
