"use client";

import Box from "@mui/material/Box";
import { useCallback, useEffect, useRef, useState } from "react";
import { addUserFeed, fetchFeeds, removeUserFeed, syncFeeds } from "./actions";
import FeedList from "./components/FeedList";
import FilterHeader from "./components/filter-header";
import SettingsDrawer from "./components/SettingsDrawer";

function useSimpleSession() {
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await fetch("/api/auth", {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setStatus(data.authenticated ? "authenticated" : "unauthenticated");
				} else {
					setStatus("unauthenticated");
				}
			} catch {
				setStatus("unauthenticated");
			}
		};

		checkSession();
	}, []);

	return { status };
}

export default function FeedManager() {
	const { status } = useSimpleSession();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [urls, setUrls] = useState([]);
	const [initLoadDone, setInitLoadDone] = useState(false);
	const [duration, setDuration] = useState("week");

	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [failedFeeds, setFailedFeeds] = useState(null);
	const [lastRefresh, setLastRefresh] = useState(null);
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [syncStatus, setSyncStatus] = useState({
		loading: false,
		error: null,
		lastSync: null,
		info: null,
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSources, setSelectedSources] = useState([]);
	const ITEMS_PER_BATCH = 20;
	const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_BATCH);

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

	useEffect(() => {
		if (typeof window === "undefined") return;

		if (status === "loading") return;

		const loadInitialData = async () => {
			let loadedUrls = [];
			let loadedDuration = "week";

			if (status === "authenticated") {
				const localSavedUrls = localStorage.getItem("focusFeedsUrls");
				let localFeeds = [];
				if (localSavedUrls) {
					try {
						const parsed = JSON.parse(localSavedUrls);
						if (Array.isArray(parsed)) localFeeds = parsed;
					} catch (_e) {}
				}

				setSyncStatus((prev) => ({ ...prev, loading: true, error: null }));
				const result = await syncFeeds(localFeeds, { mergeStrategy: "merge" });

				if (result.success) {
					loadedUrls = result.feeds.map((f) => f.url);
					setSyncStatus({
						loading: false,
						error: null,
						lastSync: Date.now(),
						info: result.syncInfo,
					});
				} else {
					console.error("Failed to sync/load user feeds", result.error);
					setSyncStatus({
						loading: false,
						error: result.error,
						lastSync: null,
						info: null,
					});
				}

				const savedDuration = localStorage.getItem("focusFeedsDuration");
				if (savedDuration) loadedDuration = savedDuration;
			} else {
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

	useEffect(() => {
		if (initLoadDone && status === "unauthenticated") {
			localStorage.setItem("focusFeedsUrls", JSON.stringify(urls));
			localStorage.setItem("focusFeedsDuration", duration);
		}
		if (initLoadDone) {
			localStorage.setItem("focusFeedsDuration", duration);
		}
	}, [urls, duration, initLoadDone, status]);

	const cacheRef = useRef(new Map());
	const CACHE_DURATION = 5 * 60 * 1000;
	const abortControllerRef = useRef(null);

	const loadFeeds = useCallback(
		async (forceRefresh = false) => {
			if (!initLoadDone) return;
			if (urls.length === 0 && initLoadDone) {
				setItems([]);
				setLoading(false);
				return;
			}

			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			abortControllerRef.current = new AbortController();

			const cacheKey = `${urls.sort().join(",")}|${duration}`;
			const cached = cacheRef.current.get(cacheKey);

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

			if (urls.length === 0) {
				setItems([]);
				setLoading(false);
				return;
			}

			try {
				const response = await fetchFeeds(urls, duration);

				if (abortControllerRef.current?.signal.aborted) {
					return;
				}

				if (response.success) {
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
		setUrls((prev) => prev.filter((url) => url !== urlToRemove));

		if (status === "authenticated") {
			const result = await removeUserFeed(urlToRemove);
			if (!result.success) {
				console.error("Failed to remove feed remotely");
			}
		}
	};

	const handleAdd = async (newUrl) => {
		if (newUrl && !urls.includes(newUrl)) {
			setUrls((prev) => [...prev, newUrl]);

			if (status === "authenticated") {
				const result = await addUserFeed(newUrl);
				if (!result.success) {
					console.error("Failed to add feed remotely");
				}
			}
		}
	};

	const handleOpenDrawer = () => {
		setDrawerOpen(true);
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setSelectedSources([]);
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
	};

	const handleSignOut = async () => {
		try {
			await fetch("/api/auth", {
				method: "DELETE",
				credentials: "include",
			});
			window.location.reload();
		} catch (error) {
			console.error("Failed to sign out:", error);
		}
	};

	const clearCache = () => {
		cacheRef.current.clear();
		loadFeeds(true);
	};

	const handleLoadMore = () => {
		setDisplayLimit((prev) => prev + ITEMS_PER_BATCH);
	};

	const sources = [
		...new Set(items.map((item) => item.feedTitle || item.source || "Unknown")),
	].sort();

	const filteredItems = items.filter((item) => {
		const matchesSearch = searchQuery
			? (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
				(item.contentSnippet || "")
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				(item.content || "").toLowerCase().includes(searchQuery.toLowerCase())
			: true;

		const matchesSource =
			selectedSources.length > 0
				? selectedSources.includes(item.feedTitle || item.source || "Unknown")
				: true;

		return matchesSearch && matchesSource;
	});

	const visibleItems = filteredItems.slice(0, displayLimit);
	const hasMoreItems = filteredItems.length > displayLimit;

	useEffect(() => {
		setDisplayLimit(ITEMS_PER_BATCH);
	}, [searchQuery, selectedSources, ITEMS_PER_BATCH]);

	return (
		<>
			<FilterHeader
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				sources={sources}
				selectedSources={selectedSources}
				onSourcesChange={setSelectedSources}
				onRefresh={() => loadFeeds(true)}
				onOpenSettings={handleOpenDrawer}
				onClearFilters={handleClearFilters}
				filteredCount={filteredItems.length}
				totalCount={items.length}
				loading={loading}
			/>

			<Box sx={{ maxWidth: "800px", mx: "auto", pb: 4, pt: 2 }}>
				<FeedList
					loading={loading}
					error={error}
					failedFeeds={failedFeeds}
					items={visibleItems}
					onRefresh={() => loadFeeds(true)}
					hasMoreItems={hasMoreItems}
					onLoadMore={handleLoadMore}
					totalCount={filteredItems.length}
				/>

				<SettingsDrawer
					open={drawerOpen}
					onClose={handleCloseDrawer}
					urls={urls}
					onAdd={handleAdd}
					onRemove={handleRemove}
					itemsCount={items.length}
					lastRefresh={lastRefresh}
					onRefresh={() => loadFeeds(true)}
					onClearCache={clearCache}
					duration={duration}
					onDurationChange={setDuration}
					syncStatus={syncStatus}
					status={status}
					onSignOut={handleSignOut}
					deferredPrompt={deferredPrompt}
					onInstall={handleInstallClick}
				/>
			</Box>
		</>
	);
}
