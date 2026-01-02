"use server";

import Parser from "rss-parser";

export async function fetchFeeds(urls) {
  const parser = new Parser();

  // Validate input
  if (!urls || urls.length === 0) {
    return { 
      success: false, 
      error: "No feed URLs provided",
      items: [] 
    };
  }

  try {
    const results = await Promise.allSettled(
      urls.map((url) => parser.parseURL(url))
    );

    const allItems = [];
    const failedFeeds = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const feedItems = result.value.items.map((item) => ({
          ...item,
          source: result.value.title || "Unknown Source",
          feedUrl: urls[index],
        }));
        allItems.push(...feedItems);
      } else {
        failedFeeds.push({
          url: urls[index],
          error: result.reason?.message || "Unknown error"
        });
        console.error(`Feed failed [${urls[index]}]:`, result.reason);
      }
    });

    const sortedItems = allItems.sort(
      (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
    );

    return {
      success: true,
      items: sortedItems,
      failedFeeds: failedFeeds.length > 0 ? failedFeeds : null,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error("Unexpected error in fetchFeeds:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch feeds",
      items: []
    };
  }
}
