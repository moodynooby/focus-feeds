"use server";

import Parser from "rss-parser";

export async function fetchFeeds(urls) {
  const parser = new Parser();

  // Fetch all feeds in parallel using Promise.allSettled
  // (This way, if one feed fails, the others still load)
  const results = await Promise.allSettled(
    urls.map((url) => parser.parseURL(url)),
  );

  const allItems = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      // Add the source title to each item so we know where it came from
      const feedItems = result.value.items.map((item) => ({
        ...item,
        source: result.value.title || "Unknown Source",
      }));
      allItems.push(...feedItems);
    } else {
      console.error("Feed failed:", result.reason);
    }
  });

  // Sort all items by date (newest first)
  return allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}
