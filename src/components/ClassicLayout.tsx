"use client";

import Box from "@mui/material/Box";
import SourceFilter from "@/components/filter-header/SourceFilter";
import BaseLayout from "@/components/layouts/BaseLayout";
import FeedList from "@/features/feeds/components/FeedList";
import type { FailedFeed, FeedItem } from "@/types";

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
	readerMode?: boolean;
	onOpenReader?: (item: FeedItem) => void;
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
	readerMode = false,
	onOpenReader,
}: ClassicLayoutProps) {
	return (
		<BaseLayout
			onRefresh={onRefresh}
			onOpenSettings={onOpenSettings}
			onClearFilters={onClearFilters}
			filteredCount={filteredCount}
			totalCount={totalCount}
			loading={loading}
			isOnline={isOnline}
			sourceFilter={
				<SourceFilter
					sources={sources}
					selectedSources={selectedSources}
					onChange={onSourcesChange}
				/>
			}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
		>
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
					readerMode={readerMode}
					onOpenReader={onOpenReader}
				/>
			</Box>
		</BaseLayout>
	);
}
