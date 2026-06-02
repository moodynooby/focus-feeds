"use client";

import Box from "@mui/material/Box";
import type { FailedFeed, FeedItem } from "@/types";
import FeedList from "./FeedList";
import SourceFilter from "./filter-header/SourceFilter";
import AppHeader from "./header/AppHeader";
import OfflineBanner from "./shared/OfflineBanner";

interface ClassicLayoutProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	sources: string[];
	selectedSources: string[];
	onSourcesChange: (sources: string[]) => void;
	items: FeedItem[];
	loading: boolean;
	onRefresh: () => void;
	onOpenSettings: () => void;
	onClearFilters: () => void;
	filteredCount: number;
	totalCount: number;
	error?: string;
	failedFeeds?: FailedFeed[] | null;
	hasMoreItems?: boolean;
	onLoadMore?: () => void;
	isOnline?: boolean;
}

export default function ClassicLayout({
	searchQuery,
	onSearchChange,
	sources,
	selectedSources,
	onSourcesChange,
	items,
	loading,
	onRefresh,
	onOpenSettings,
	onClearFilters,
	filteredCount,
	totalCount,
	error,
	failedFeeds,
	hasMoreItems,
	onLoadMore,
	isOnline = true,
}: ClassicLayoutProps) {
	return (
		<>
			{!isOnline && <OfflineBanner />}
			<AppHeader
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				sourceFilter={
					<SourceFilter
						sources={sources}
						selectedSources={selectedSources}
						onChange={onSourcesChange}
					/>
				}
				onRefresh={onRefresh}
				onOpenSettings={onOpenSettings}
				onClearFilters={onClearFilters}
				filteredCount={filteredCount}
				totalCount={totalCount}
				loading={loading}
			/>

			<Box sx={{ maxWidth: "800px", mx: "auto", pb: 4, pt: 2 }}>
				<FeedList
					loading={loading}
					error={error}
					failedFeeds={failedFeeds}
					items={items}
					onRefresh={onRefresh}
					hasMoreItems={hasMoreItems}
					onLoadMore={onLoadMore}
					totalCount={totalCount}
				/>
			</Box>
		</>
	);
}
