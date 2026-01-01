"use client";

import { useState, useEffect } from "react";

export function usePersistedUrls(defaultUrls) {
  const [urls, setUrls] = useState(defaultUrls);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("rss-feeds");
    if (saved) {
      try {
        setUrls(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse saved feeds:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever urls change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("rss-feeds", JSON.stringify(urls));
    }
  }, [urls, isLoaded]);

  return [urls, setUrls];
}
