"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchFeeds } from "./actions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import Input from "@mui/material/Input";
import TabPanel from "@mui/lab/TabPanel";
import Avatar from "@mui/material/Avatar";

export default function FeedManager() {
  const [value, setValue] = useState("1");
  const [urls, setUrls] = useState([
    "https://hnrss.org/frontpage",
    "https://www.theverge.com/rss/index.xml",
  ]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [failedFeeds, setFailedFeeds] = useState(null);
  const [newUrl, setNewUrl] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  // Feature #4: Caching
  const cacheRef = useRef(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Feature #3: Request cancellation
  const abortControllerRef = useRef(null);

  // Feature #5: Manual refresh function
  const loadFeeds = useCallback(
    async (forceRefresh = false) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const cacheKey = urls.sort().join(",");
      const cached = cacheRef.current.get(cacheKey);

      // Check cache (unless force refresh)
      if (
        !forceRefresh &&
        cached &&
        Date.now() - cached.timestamp < CACHE_DURATION
      ) {
        console.log("📦 Using cached data");
        setItems(cached.items);
        setFailedFeeds(cached.failedFeeds);
        setLastRefresh(new Date(cached.timestamp));
        return;
      }

      setLoading(true);
      setError(null);
      setFailedFeeds(null);

      try {
        console.log("🌐 Fetching fresh data");
        const response = await fetchFeeds(urls);

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          console.log("❌ Request was cancelled");
          return;
        }

        if (response.success) {
          // Update cache
          cacheRef.current.set(cacheKey, {
            items: response.items,
            failedFeeds: response.failedFeeds,
            timestamp: response.timestamp,
          });

          setItems(response.items);
          setFailedFeeds(response.failedFeeds);
          setLastRefresh(new Date(response.timestamp));
        } else {
          setError(response.error);
          setItems([]);
        }
      } catch (err) {
        // Don't show error if request was cancelled
        if (err.name !== "AbortError") {
          setError("Network error: Failed to connect to server");
          console.error("Client error:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [urls],
  );

  // Auto-load when URLs change
  useEffect(() => {
    if (urls.length > 0) {
      loadFeeds();
    }

    // Cleanup: cancel request when URLs change or component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [urls, loadFeeds]);

  // Handler to remove a link
  const handleRemove = (urlToRemove) => {
    setUrls(urls.filter((url) => url !== urlToRemove));
  };

  // Handler to add a new link
  const handleAdd = (e) => {
    e.preventDefault();
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]);
      setNewUrl("");
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Format last refresh time
  const formatRefreshTime = () => {
    if (!lastRefresh) return "";
    const now = Date.now();
    const diff = now - lastRefresh.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    return lastRefresh.toLocaleTimeString();
  };
  return (
    <div style={{ margin: "1px", padding: "2.2rem", textWrap: "wrap" }}>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            maxWidth: "100%",
            "& .MuiTabs-scroller": {
              overflowX: "auto !important",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            },
          }}
        >
          <Tab label="Focus Feeds" value="1" />
          <Tab label="Feeds Manager" value="2" />
          <Tab label="Settings" value="3" />
        </TabList>
        <TabPanel value="1">
          {/* Error display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {/* Partial failure warning */}
          {failedFeeds && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Some feeds failed to load:</strong>
              <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem" }}>
                {failedFeeds.map((feed, idx) => (
                  <li key={idx}>
                    {feed.url}: {feed.error}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Loading state */}
          {loading && items.length === 0
            ? <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                <CircularProgress size={24} />
                <span>Loading feeds...</span>
              </Box>
            : <div>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "2rem",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Avatar>
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}&sz=32`}
                          alt="favicon"
                          style={{ width: 16, height: 16, borderRadius: "4px" }}
                        />
                      </Avatar>
                      <span style={{ fontWeight: "bold" }}>{item.source}</span>
                    </div>
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
              </div>}
        </TabPanel>
        <TabPanel value="2">
          <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem" }}>
            <Input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter RSS URL..."
              required
              style={{ flex: 1, padding: "0.5rem", textOverflow: "ellipsis" }}
              autoComplete="off"
            />
            <Button type="submit" variant="contained">
              Add Feed
            </Button>
          </form>
          {/* Feed list */}
          <Box sx={{ width: "98%" }}>
            {urls.map((url) => (
              <Box
                key={url}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1,
                  borderBottom: "1px solid #eee",
                }}
              >
                <span style={{ flex: 1, wordBreak: "break-all" }}>{url}</span>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemove(url)}
                  sx={{ ml: 1 }}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>{" "}
        </TabPanel>
        <TabPanel value="3">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>
                Combined Feed ({items.length} items)
              </h2>
              {lastRefresh && !loading && (
                <span style={{ fontSize: "0.85rem", color: "#666" }}>
                  Updated {formatRefreshTime()}
                </span>
              )}
            </div>

            <Button
              variant="contained"
              startIcon={
                loading
                  ? <CircularProgress size={16} color="inherit" />
                  : <RefreshIcon />
              }
              onClick={() => loadFeeds(true)} // Force refresh
              disabled={loading}
              sx={{
                textTransform: "none",
                minWidth: "120px",
              }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </Box>

          <Button
            variant="outlined"
            onClick={() => {
              cacheRef.current.clear();
              loadFeeds(true);
            }}
          >
            Clear Cache & Refresh
          </Button>
        </TabPanel>
      </TabContext>
    </div>
  );
}
