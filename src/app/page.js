"use client";

import { useState, useEffect } from "react";
import { fetchFeeds } from "./actions"; // Import the server action

export default function FeedManager() {
  // 1. Manage your list of links here
  const [urls, setUrls] = useState([
    "https://hnrss.org/frontpage",
    "https://www.theverge.com/rss/index.xml",
  ]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");

  // 2. Function to trigger the server fetch
  async function loadFeeds() {
    setLoading(true);
    try {
      const data = await fetchFeeds(urls);
      setItems(data);
    } catch (error) {
      console.error("Failed to load feeds", error);
    }
    setLoading(false);
  }

  // Initial load and reload whenever 'urls' changes
  useEffect(() => {
    loadFeeds();
  }, [urls]);

  // Handler to add a new link via JS/UI
  const handleAdd = (e) => {
    e.preventDefault();
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]); // This triggers the useEffect
      setNewUrl("");
    }
  };

  // Handler to remove a link
  const handleRemove = (urlToRemove) => {
    setUrls(urls.filter((url) => url !== urlToRemove));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      {/* --- Control Panel --- */}
      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Manage Feeds</h3>

        <ul style={{ marginBottom: "1rem" }}>
          {urls.map((url) => (
            <li
              key={url}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem", fontFamily: "monospace" }}>
                {url}
              </span>
              <button
                onClick={() => handleRemove(url)}
                style={{
                  color: "red",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Enter RSS URL..."
            required
            style={{ flex: 1, padding: "0.5rem" }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              background: "black",
              color: "white",
              border: "none",
            }}
          >
            Add Feed
          </button>
        </form>
      </div>

      {/* --- Feed Display --- */}
      {loading ? (
        <p>Loading feeds...</p>
      ) : (
        <div>
          <h2 style={{ marginBottom: "1rem" }}>
            Combined Feed ({items.length} items)
          </h2>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "2rem",
                borderBottom: "1px solid #eee",
                paddingBottom: "1rem",
              }}
            >
              <span
                style={{
                  background: "#eee",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  display: "inline-block",
                  marginBottom: "0.5rem",
                }}
              >
                {item.source}
              </span>

              <h3 style={{ margin: "0.5rem 0" }}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", color: "#0070f3" }}
                >
                  {item.title}
                </a>
              </h3>
              <div style={{ color: "#666", fontSize: "0.85rem" }}>
                {new Date(item.pubDate).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
