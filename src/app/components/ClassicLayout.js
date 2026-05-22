"use client";

import Box from "@mui/material/Box";
import FeedList from "./FeedList";
import FilterHeader from "./filter-header/FilterHeader";

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
}) {
	return (
		<>
			<FilterHeader
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				sources={sources}
				selectedSources={selectedSources}
				onSourcesChange={onSourcesChange}
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
