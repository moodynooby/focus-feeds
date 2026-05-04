"use client";

import Box from "@mui/material/Box";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useDebounceValue, useLocalStorage } from "usehooks-ts";
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

const ITEMS_PER_BATCH = 20;

export default function FeedManager() {
	const { status } = useSimpleSession();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_BATCH);

	const [urls, setUrls] = useLocalStorage("focusFeedsUrls", []);
	const [duration, setDuration] = useLocalStorage("focusFeedsDuration", "week");

	const [syncStatus, setSyncStatus] = useState({
		loading: false,
		error: null,
		lastSync: null,
		info: null,
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSources, setSelectedSources] = useState([]);

	const [debouncedSearchQuery] = useDebounceValue(searchQuery, 300);
	const prevFiltersRef = useRef({ search: "", sources: [] });

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

	const { data, error, isLoading, mutate } = useSWR(
		urls.length > 0 ? [urls, duration] : null,
		async ([urls, duration]) => {
			const result = await fetchFeeds(urls, duration);
			if (!result.success)
				throw new Error(result.error || "Failed to fetch feeds");
			return result;
		},
		{
			refreshInterval: 5 * 60 * 1000,
			revalidateOnFocus: true,
			dedupingInterval: 2000,
		},
	);

	const items = data?.items ?? [];
	const failedFeeds = data?.failedFeeds ?? null;
	const lastRefresh = data?.timestamp ? new Date(data.timestamp) : null;

	useEffect(() => {
		if (status !== "loading" && urls.length === 0 && !syncStatus.lastSync) {
			setUrls([
				"https://hnrss.org/frontpage",
				"https://feeds.megaphone.fm/vergecast",
			]);
		}
	}, [status, urls.length, syncStatus.lastSync, setUrls]);

	const hasSyncedRef = useRef(false);
	useEffect(() => {
		if (status !== "authenticated" || hasSyncedRef.current) return;
		hasSyncedRef.current = true;

		const syncUserFeeds = async () => {
			setSyncStatus((prev) => ({ ...prev, loading: true, error: null }));
			const result = await syncFeeds(urls, { mergeStrategy: "merge" });

			if (result.success) {
				const serverUrls = result.feeds.map((f) => f.url);
				if (JSON.stringify(serverUrls) !== JSON.stringify(urls)) {
					setUrls(serverUrls);
				}
				setSyncStatus({
					loading: false,
					error: null,
					lastSync: Date.now(),
					info: result.syncInfo,
				});
			} else {
				console.error("Failed to sync feeds:", result.error);
				setSyncStatus({
					loading: false,
					error: result.error,
					lastSync: null,
					info: null,
				});
			}
		};

		syncUserFeeds();
	}, [status, urls, setUrls]);

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
		mutate(undefined, { revalidate: true });
	};

	const handleLoadMore = () => {
		setDisplayLimit((prev) => prev + ITEMS_PER_BATCH);
	};

	const sources = useMemo(
		() =>
			[
				...new Set(
					items.map((item) => item.feedTitle || item.source || "Unknown"),
				),
			].sort(),
		[items],
	);

	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			const matchesSearch = debouncedSearchQuery
				? (item.title || "")
						.toLowerCase()
						.includes(debouncedSearchQuery.toLowerCase()) ||
					(item.contentSnippet || "")
						.toLowerCase()
						.includes(debouncedSearchQuery.toLowerCase()) ||
					(item.content || "")
						.toLowerCase()
						.includes(debouncedSearchQuery.toLowerCase())
				: true;

			const matchesSource =
				selectedSources.length > 0
					? selectedSources.includes(item.feedTitle || item.source || "Unknown")
					: true;

			return matchesSearch && matchesSource;
		});
	}, [items, debouncedSearchQuery, selectedSources]);

	const visibleItems = filteredItems.slice(0, displayLimit);
	const hasMoreItems = filteredItems.length > displayLimit;

	useEffect(() => {
		const prev = prevFiltersRef.current;
		const currSearch = debouncedSearchQuery;
		const currSources = selectedSources;
		if (
			prev.search !== currSearch ||
			prev.sources.join() !== currSources.join()
		) {
			setDisplayLimit(20);
			prevFiltersRef.current = { search: currSearch, sources: currSources };
		}
	}, [debouncedSearchQuery, selectedSources]);

	return (
		<>
			<FilterHeader
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				sources={sources}
				selectedSources={selectedSources}
				onSourcesChange={setSelectedSources}
				onRefresh={() => mutate(undefined, { revalidate: true })}
				onOpenSettings={handleOpenDrawer}
				onClearFilters={handleClearFilters}
				filteredCount={filteredItems.length}
				totalCount={items.length}
				loading={isLoading}
			/>

			<Box sx={{ maxWidth: "800px", mx: "auto", pb: 4, pt: 2 }}>
				<FeedList
					loading={isLoading}
					error={error?.message}
					failedFeeds={failedFeeds}
					items={visibleItems}
					onRefresh={() => mutate(undefined, { revalidate: true })}
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
					onRefresh={() => mutate(undefined, { revalidate: true })}
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
