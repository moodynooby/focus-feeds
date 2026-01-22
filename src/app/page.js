"use client";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchFeeds,
  getUserFeeds,
  addUserFeed,
  removeUserFeed,
  syncFeeds,
} from "./actions";
import AddFeed from "./components/AddFeed";
import FeedList from "./components/FeedList";
import Settings from "./components/Settings";
import { useSession } from "next-auth/react";

export default function FeedManager() {
  const { data: session, status } = useSession();
  const [value, setValue] = useState("1");
  const [urls, setUrls] = useState([]);
  const [initLoadDone, setInitLoadDone] = useState(false);
  const [duration, setDuration] = useState("week"); // Default to week

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Initial Load (Auth vs Local)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Wait for session to be loading
    if (status === "loading") return;

    const loadInitialData = async () => {
      let loadedUrls = [];
      let loadedDuration = "week";

      if (status === "authenticated") {
        // Sync Logic:
        // 1. Get local feeds
        const localSavedUrls = localStorage.getItem("focusFeedsUrls");
        let localFeeds = [];
        if (localSavedUrls) {
          try {
            const parsed = JSON.parse(localSavedUrls);
            if (Array.isArray(parsed)) localFeeds = parsed;
          } catch (e) { }
        }

        // 2. Perform Sync if local feeds exist (or even if empty, to get remote)
        // If we want to merge, we send localFeeds.
        const result = await syncFeeds(localFeeds);

        if (result.success) {
          loadedUrls = result.feeds.map(f => f.url);
          // Optional: Clear local storage or keep it in sync? 
          // Let's keep it in sync for offline fallback, but generally we rely on DB now.
        } else {
          console.error("Failed to sync/load user feeds", result.error);
        }

        const savedDuration = localStorage.getItem("focusFeedsDuration");
        if (savedDuration) loadedDuration = savedDuration;

      } else {
        // Load from LocalStorage
        const savedUrls = localStorage.getItem("focusFeedsUrls");
        if (savedUrls) {
          try {
            const parsed = JSON.parse(savedUrls);
            if (Array.isArray(parsed)) {
              loadedUrls = parsed;
            }
          } catch (e) {
            console.error("Failed to parse saved feeds", e);
          }
        } else {
          // Defaults for new unauth users
          loadedUrls = [
            "https://hnrss.org/frontpage",
            "https://feeds.megaphone.fm/vergecast",
          ];
        }

        const savedDuration = localStorage.getItem("focusFeedsDuration");
        if (savedDuration) {
          loadedDuration = savedDuration;
        }
      }

      setUrls(loadedUrls);
      setDuration(loadedDuration);
      setInitLoadDone(true);
    };

    loadInitialData();
  }, [status]);

  // Sync back to local storage if unauthenticated
  useEffect(() => {
    if (initLoadDone && status === "unauthenticated") {
      localStorage.setItem("focusFeedsUrls", JSON.stringify(urls));
      localStorage.setItem("focusFeedsDuration", duration);
    }
    // Always save duration locally for now
    if (initLoadDone) {
      localStorage.setItem("focusFeedsDuration", duration);
    }
  }, [urls, duration, initLoadDone, status]);

  const cacheRef = useRef(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const abortControllerRef = useRef(null);

  const loadFeeds = useCallback(
    async (forceRefresh = false) => {
      if (!initLoadDone) return;
      if (urls.length === 0 && initLoadDone) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      // Include duration in cache key
      const cacheKey = urls.sort().join(",") + `|${duration}`;
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
        const response = await fetchFeeds(urls, duration);

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
    [urls, initLoadDone, duration],
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

  const handleRemove = async (urlToRemove) => {
    // Optimistic or wait? Let's optimistic for UI but parallel req
    setUrls((prev) => prev.filter((url) => url !== urlToRemove));

    if (status === "authenticated") {
      const result = await removeUserFeed(urlToRemove);
      if (!result.success) {
        // Revert on failure?
        console.error("Failed to remove feed remotely");
        // Could add back, but for now simple logging
      }
    }
  };

  const handleAdd = async (newUrl) => {
    if (newUrl && !urls.includes(newUrl)) {
      setUrls((prev) => [...prev, newUrl]);
      setValue("1"); // Switch back to feed view

      if (status === "authenticated") {
        const result = await addUserFeed(newUrl);
        if (!result.success) {
          console.error("Failed to add feed remotely");
          // Could show toast
        }
      }
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
            duration={duration}
            onDurationChange={setDuration}
          />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
