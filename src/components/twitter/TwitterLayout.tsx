"use client";

import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";
import type { FailedFeed, FeedItem } from "@/types";
import EmptyState from "../EmptyState";
import FilterHeader from "../filter-header/FilterHeader";
import OfflineBanner from "../shared/OfflineBanner";
import SkeletonList from "../shared/SkeletonList";
import TwitterFeedItem from "./TwitterFeedItem";
import { twitterTheme } from "@/lib/twitter-theme";

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
	failedFeeds?: FailedFeed[] | null;
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
	failedFeeds,
	hasMoreItems,
	onLoadMore,
	isOnline = true,
}: TwitterLayoutProps) {
	return (
		<ThemeProvider theme={twitterTheme("dark")}>
			<Box
				sx={{
					minHeight: "100vh",
					bgcolor: "background.default",
					color: "text.primary",
				}}
			>
				{!isOnline && <OfflineBanner />}

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
						<SkeletonList count={10} />
					) : error ? (
						<EmptyState
							title="Error loading feeds"
							subtitle={error}
							onRetry={onRefresh}
						/>
					) : items.length === 0 ? (
						<EmptyState
							title="No articles found"
							subtitle="Try adjusting your filters or adding new feeds"
							onRetry={onRefresh}
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
									<Box
										component="button"
										onClick={onLoadMore}
										sx={{
											bgcolor: "rgba(29, 155, 240, 0.1)",
											color: "#1d9bf0",
											border: "none",
											borderRadius: 999,
											py: 1,
											px: 3,
											fontWeight: 700,
											fontSize: "0.875rem",
											cursor: "pointer",
											"&:hover": {
												bgcolor: "rgba(29, 155, 240, 0.2)",
											},
										}}
									>
										Show more
										</Box>
									</Box>
								</Box>
							)}
						</>
					)}
				</Box>
			</Box>
		</ThemeProvider>
	);
}
