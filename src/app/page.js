"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { fetchFeeds } from "./actions";
import FeedList from "./components/FeedList";
import AddFeed from "./components/AddFeed";
import Settings from "./components/Settings";

export default function FeedManager() {
  const [value, setValue] = useState("1");
  const [urls, setUrls] = useState([
    "https://hnrss.org/frontpage",
    "https://www.theverge.com/rss/index.xml",
  ]);
  const [initLoadDone, setInitLoadDone] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading true to fetch defaults
  const [error, setError] = useState(null);
  const [failedFeeds, setFailedFeeds] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // Persistence for URLs
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focusFeedsUrls");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setUrls(parsed);
          }
        } catch (e) {
          console.error("Failed to parse saved feeds", e);
        }
      }
      setInitLoadDone(true);
    }
  }, []);

  useEffect(() => {
    if (initLoadDone) {
      localStorage.setItem("focusFeedsUrls", JSON.stringify(urls));
    }
  }, [urls, initLoadDone]);

  const cacheRef = useRef(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const abortControllerRef = useRef(null);

  const loadFeeds = useCallback(
    async (forceRefresh = false) => {
      if (!initLoadDone && urls.length === 0) return;

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
        setItems(cached.items);
        setFailedFeeds(cached.failedFeeds);
        setLastRefresh(new Date(cached.timestamp));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setFailedFeeds(null);

      // If no URLs, just clear items
      if (urls.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetchFeeds(urls);

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
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
        if (err.name !== "AbortError") {
          setError("Network error: Failed to connect to server");
          console.error("Client error:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [urls, initLoadDone],
  );

  // Auto-load when URLs useffect-init triggers, or when URLs change
  useEffect(() => {
    if (initLoadDone) {
      loadFeeds();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadFeeds, initLoadDone]);

  const handleRemove = (urlToRemove) => {
    setUrls(urls.filter((url) => url !== urlToRemove));
  };

  const handleAdd = (newUrl) => {
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]);
      setValue("1"); // Switch back to feed view
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const clearCache = () => {
    cacheRef.current.clear();
    loadFeeds(true);
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 4 }}>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            maxWidth: "100%",
            mb: 2,
            "& .MuiTabs-scroller": {
              overflowX: "auto !important",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            },
          }}
        >
          <Tab label="Focus Feeds" value="1" />
          <Tab label="Feeds Manager" value="2" />
          <Tab label="Settings" value="3" />
        </TabList>

        <TabPanel value="1" sx={{ px: 0 }}>
          <FeedList
            loading={loading}
            error={error}
            failedFeeds={failedFeeds}
            items={items}
            onRefresh={() => loadFeeds(true)}
          />
        </TabPanel>

        <TabPanel value="2" sx={{ px: 0 }}>
          <AddFeed urls={urls} onAdd={handleAdd} onRemove={handleRemove} />
        </TabPanel>

        <TabPanel value="3" sx={{ px: 0 }}>
          <Settings
            deferredPrompt={deferredPrompt}
            onInstall={handleInstallClick}
            loading={loading}
            itemsCount={items.length}
            lastRefresh={lastRefresh}
            onRefresh={() => loadFeeds(true)}
            onClearCache={clearCache}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
