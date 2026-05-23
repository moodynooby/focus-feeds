"use client";

import { Fab, Tooltip } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useDebounceValue, useLocalStorage } from "usehooks-ts";
import {
	addUserFeed,
	checkAuth,
	fetchFeeds,
	removeUserFeed,
	signOut,
	syncFeeds,
} from "./actions";
import ClassicLayout from "./components/ClassicLayout";
import GmailLayout from "./components/gmail/GmailLayout";
import SettingsDrawer from "./components/SettingsDrawer";
import { toggleListItem } from "./components/utils";
import { gmailTheme } from "./gmail-theme";
import { MODE_CONFIG } from "./modes";

function useSimpleSession() {
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		checkAuth().then((data) => {
			setStatus(data.authenticated ? "authenticated" : "unauthenticated");
		});
	}, []);

	return { status };
}

function useServiceWorker() {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					console.log("SW registered:", registration);
				})
				.catch((error) => {
					console.log("SW registration failed:", error);
				});
		}
	}, []);
}

const ITEMS_PER_BATCH = 20;

export default function FeedManager() {
	useServiceWorker();
	const { status } = useSimpleSession();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [installStatus, setInstallStatus] = useState("available");
	const [isOnline, setIsOnline] = useState(true); // available, installed, dismissed
	const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_BATCH);

	const [urls, setUrls] = useLocalStorage("focusFeedsUrls", []);
	const [duration, setDuration] = useLocalStorage("focusFeedsDuration", "week");
	const [mode, setMode] = useLocalStorage("focusFeedsMode", "classic");

	// Migrate old localStorage key
	useEffect(() => {
		const oldVal = localStorage.getItem("focusFeedsGhostMode");
		if (oldVal !== null) {
			setMode(oldVal === "true" ? "gmail" : "classic");
			localStorage.removeItem("focusFeedsGhostMode");
		}
	}, [setMode]);
	const [starredItems, setStarredItems] = useLocalStorage(
		"focusFeedsStarredItems",
		[],
	);

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
			setInstallStatus("available");
		};

		const handleAppInstalled = () => {
			setInstallStatus("installed");
			setDeferredPrompt(null);
		};

		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		setIsOnline(navigator.onLine);
		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setInstallStatus("installed");
			setDeferredPrompt(null);
		} else {
			setInstallStatus("dismissed");
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
		const result = await signOut();
		if (result.success) {
			window.location.reload();
		} else {
			console.error("Failed to sign out:", result.error);
		}
	};

	const clearCache = () => {
		mutate(undefined, { revalidate: true });
	};

	const handleLoadMore = () => {
		setDisplayLimit((prev) => prev + ITEMS_PER_BATCH);
	};

	const sources = [
		...new Set(items.map((item) => item.feedTitle || item.source || "Unknown")),
	].sort();

	const [view, setView] = useState("inbox"); // inbox, starred

	const filteredItems = items.filter((item) => {
		const itemId = item.guid || item.link;
		if (view === "starred" && !starredItems.includes(itemId)) {
			return false;
		}

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

	const toggleStar = (id) => {
		setStarredItems((prev) => toggleListItem(prev, id));
	};

	const appTheme = useTheme();
	const currentMode = MODE_CONFIG[mode] || MODE_CONFIG.classic;
	const nextMode = currentMode.nextMode;
	const nextConfig = MODE_CONFIG[nextMode];

	const refresh = () => mutate(undefined, { revalidate: true });

	const content =
		mode === "gmail" ? (
			<ThemeProvider theme={gmailTheme(appTheme.palette.mode)}>
				<GmailLayout
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					sources={sources}
					selectedSources={selectedSources}
					onSourcesChange={setSelectedSources}
					items={filteredItems}
					starredItems={starredItems}
					onToggleStar={toggleStar}
					onOpenSettings={handleOpenDrawer}
					onSignOut={handleSignOut}
					status={status}
					loading={isLoading}
					onAddFeed={handleOpenDrawer}
					view={view}
					onViewChange={setView}
					onRefresh={refresh}
					isOnline={isOnline}
				/>
			</ThemeProvider>
		) : (
			<ClassicLayout
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				sources={sources}
				selectedSources={selectedSources}
				onSourcesChange={setSelectedSources}
				items={visibleItems}
				loading={isLoading}
				onRefresh={refresh}
				onOpenSettings={handleOpenDrawer}
				onClearFilters={handleClearFilters}
				filteredCount={filteredItems.length}
				totalCount={items.length}
				error={error?.message}
				failedFeeds={failedFeeds}
				hasMoreItems={hasMoreItems}
				onLoadMore={handleLoadMore}
				isOnline={isOnline}
			/>
		);

	return (
		<>
			{content}

			<Tooltip title={nextConfig.fabTooltip}>
				<Fab
					color="primary"
					aria-label={nextConfig.fabAriaLabel}
					onClick={() => setMode(nextMode)}
					sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 2000 }}
				>
					<nextConfig.icon />
				</Fab>
			</Tooltip>

			<SettingsDrawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				urls={urls}
				onAdd={handleAdd}
				onRemove={handleRemove}
				itemsCount={items.length}
				lastRefresh={lastRefresh}
				onRefresh={refresh}
				onClearCache={clearCache}
				duration={duration}
				onDurationChange={setDuration}
				syncStatus={syncStatus}
				status={status}
				onSignOut={handleSignOut}
				deferredPrompt={deferredPrompt}
				onInstall={handleInstallClick}
				installStatus={installStatus}
			/>
		</>
	);
}
