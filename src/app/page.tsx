"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useLocalStorage } from "usehooks-ts";
import ClassicLayout from "@/components/ClassicLayout";
import GmailLayout from "@/components/gmail/GmailLayout";
import SettingsDrawer from "@/components/SettingsDrawer";
import TwitterLayout from "@/components/twitter/TwitterLayout";
import useAuth from "@/features/auth/hooks/useAuth";
import ReaderView from "@/features/feeds/components/ReaderView";
import useFeedFilters from "@/features/feeds/hooks/useFeedFilters";
import useFeedSync from "@/features/feeds/hooks/useFeedSync";
import useStarredItems from "@/features/feeds/hooks/useStarredItems";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import usePWAInstall from "@/hooks/usePWAInstall";
import useServiceWorker from "@/hooks/useServiceWorker";
import { useModeContext } from "@/lib/theme";
import type { FeedDuration, FeedItem } from "@/types";
import {
	addUserFeed,
	fetchFeeds,
	fetchFullArticle,
	removeUserFeed,
} from "./actions";

const ITEMS_PER_BATCH = 20;

export default function FeedManager() {
	useServiceWorker();
	const { status, signOut } = useAuth();
	const isOnline = useOnlineStatus();
	const { deferredPrompt, installStatus, handleInstallClick } = usePWAInstall();
	const { starredItems, toggleStar, view, setView } = useStarredItems();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [urls, setUrls] = useLocalStorage<string[]>("focusFeedsUrls", []);
	const [duration, setDuration] = useLocalStorage<string>(
		"focusFeedsDuration",
		"week",
	);
	const [readerMode, setReaderMode] = useLocalStorage(
		"focusFeedsReaderMode",
		false,
	);
	const [readerItem, setReaderItem] = useState<FeedItem | null>(null);
	const { mode } = useModeContext();

	const { data, error, isLoading, mutate } = useSWR(
		urls.length > 0 ? [urls, duration] : null,
		async ([urls, duration]: [string[], string]) => {
			const result = await fetchFeeds(urls, duration as FeedDuration);
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch feeds");
			}
			return result;
		},
		{
			refreshInterval: 5 * 60 * 1000,
			revalidateOnFocus: true,
			dedupingInterval: 2000,
		},
	);

	const items: FeedItem[] = data?.items ?? [];
	const failedFeeds = data?.failedFeeds ?? null;
	const lastRefresh = data?.timestamp ? new Date(data.timestamp) : null;

	useEffect(() => {
		if (status !== "loading" && urls.length === 0) {
			setUrls([
				"https://hnrss.org/frontpage",
				"https://feeds.megaphone.fm/vergecast",
			]);
		}
	}, [status, urls.length, setUrls]);

	const { syncStatus, markSyncError } = useFeedSync({ status, urls, setUrls });

	const filters = useFeedFilters(items, ITEMS_PER_BATCH, {
		starredItems,
		view,
	});

	const handleAdd = async (newUrl: string) => {
		if (newUrl && !urls.includes(newUrl)) {
			setUrls((prev) => [...prev, newUrl]);

			if (status === "authenticated") {
				const result = await addUserFeed(newUrl);
				if (!result.success) {
					markSyncError(result.error ?? "Failed to add feed to account");
				}
			}
		}
	};

	const handleRemove = async (urlToRemove: string) => {
		setUrls((prev) => prev.filter((url) => url !== urlToRemove));

		if (status === "authenticated") {
			const result = await removeUserFeed(urlToRemove);
			if (!result.success) {
				markSyncError(result.error ?? "Failed to remove feed from account");
			}
		}
	};

	const refresh = () => mutate(undefined, { revalidate: true });

	const content =
		mode === "gmail" ? (
			<GmailLayout
				searchQuery={filters.searchQuery}
				onSearchChange={filters.setSearchQuery}
				sources={filters.sources}
				selectedSources={filters.selectedSources}
				onSourcesChange={filters.setSelectedSources}
				items={filters.filteredItems}
				starredItems={starredItems}
				onToggleStar={toggleStar}
				onOpenSettings={() => setDrawerOpen(true)}
				onSignOut={signOut}
				status={status}
				loading={isLoading}
				onAddFeed={() => setDrawerOpen(true)}
				view={view}
				onViewChange={setView}
				onRefresh={refresh}
				isOnline={isOnline}
			/>
		) : mode === "twitter" ? (
			<TwitterLayout
				searchQuery={filters.searchQuery}
				onSearchChange={filters.setSearchQuery}
				sources={filters.sources}
				selectedSources={filters.selectedSources}
				onSourcesChange={filters.setSelectedSources}
				items={filters.visibleItems}
				loading={isLoading}
				onRefresh={refresh}
				onOpenSettings={() => setDrawerOpen(true)}
				onClearFilters={filters.clearFilters}
				filteredCount={filters.filteredItems.length}
				totalCount={items.length}
				error={error?.message}
				hasMoreItems={filters.hasMoreItems}
				onLoadMore={filters.loadMore}
				isOnline={isOnline}
			/>
		) : (
			<ClassicLayout
				failedFeeds={failedFeeds}
				searchQuery={filters.searchQuery}
				onSearchChange={filters.setSearchQuery}
				sources={filters.sources}
				selectedSources={filters.selectedSources}
				onSourcesChange={filters.setSelectedSources}
				items={filters.visibleItems}
				loading={isLoading}
				onRefresh={refresh}
				onOpenSettings={() => setDrawerOpen(true)}
				onClearFilters={filters.clearFilters}
				filteredCount={filters.filteredItems.length}
				totalCount={items.length}
				error={error?.message}
				hasMoreItems={filters.hasMoreItems}
				onLoadMore={filters.loadMore}
				isOnline={isOnline}
				readerMode={readerMode}
				onOpenReader={(item: FeedItem) => setReaderItem(item)}
			/>
		);

	return (
		<>
			{content}

			<SettingsDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				urls={urls}
				onAdd={handleAdd}
				onRemove={handleRemove}
				itemsCount={items.length}
				lastRefresh={lastRefresh}
				onRefresh={refresh}
				onClearCache={refresh}
				duration={duration}
				onDurationChange={setDuration}
				syncStatus={syncStatus}
				status={status}
				onSignOut={signOut}
				deferredPrompt={deferredPrompt}
				onInstall={handleInstallClick}
				installStatus={installStatus}
				readerMode={readerMode}
				onReaderModeChange={setReaderMode}
			/>

			{readerMode && readerItem && (
				<ReaderView
					item={readerItem}
					onClose={() => setReaderItem(null)}
					fetchFullArticle={fetchFullArticle}
				/>
			)}
		</>
	);
}
