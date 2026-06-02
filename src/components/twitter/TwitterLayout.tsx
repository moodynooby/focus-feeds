"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { FeedItem } from "@/types";
import EmptyState from "../EmptyState";
import SourceFilter from "../filter-header/SourceFilter";
import AppHeader from "../header/AppHeader";
import OfflineBanner from "../shared/OfflineBanner";
import SkeletonList from "../shared/SkeletonList";
import TwitterFeedItem from "./TwitterFeedItem";

interface TwitterLayoutProps {
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
	filteredCount?: number;
	totalCount?: number;
	error?: string;
	hasMoreItems?: boolean;
	onLoadMore?: () => void;
	isOnline?: boolean;
}

export default function TwitterLayout({
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
	hasMoreItems,
	onLoadMore,
	isOnline = true,
}: TwitterLayoutProps) {
	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "background.default",
				color: "text.primary",
			}}
		>
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

			<Box
				sx={{
					maxWidth: "600px",
					mx: "auto",
					pb: 4,
					pt: 2,
					px: 2,
				}}
			>
				{loading && items.length === 0 ? (
					<SkeletonList rows={10} />
				) : error ? (
					<EmptyState
						message="Error loading feeds"
						actionLabel={error ? "Retry" : undefined}
						onAction={onRefresh}
					/>
				) : items.length === 0 ? (
					<EmptyState
						message="No articles found"
						actionLabel="Adjust filters"
						onAction={onRefresh}
					/>
				) : (
					<>
						{items.map((item) => (
							<TwitterFeedItem key={item.guid || item.link} item={item} />
						))}

						{hasMoreItems && (
							<Box
								sx={{
									textAlign: "center",
									py: 3,
								}}
							>
								<Button
									variant="outlined"
									onClick={onLoadMore}
									sx={{
										borderRadius: 999,
										fontWeight: 700,
									}}
								>
									Show more
								</Button>
							</Box>
						)}
					</>
				)}
			</Box>
		</Box>
	);
}
