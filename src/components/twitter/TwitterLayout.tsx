"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import EmptyState from "@/components/EmptyState";
import BaseLayout from "@/components/layouts/BaseLayout";
import SkeletonList from "@/components/shared/SkeletonList";
import TwitterFeedItem from "@/features/feeds/components/TwitterFeedItem";
import { MODE_CONFIG } from "@/lib/modes";
import type { FeedItem } from "@/types";

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

const twitterConfig = MODE_CONFIG.twitter;

/**
 * Twitter mode layout — pure content composition over the shared BaseLayout.
 *
 * Behavior differences preserved from the original implementation:
 * - the single "Home" nav item clears all filters when tapped,
 * - "Show more" appears when filtered results are paginated,
 * - the header mode menu is hidden (mode switching lives in the sidebar).
 */
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
	const showSkeleton = loading && items.length === 0;

	const content = showSkeleton ? (
		<SkeletonList rows={10} />
	) : error ? (
		<EmptyState
			message="Error loading feeds"
			actionLabel="Retry"
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
				<Box sx={{ textAlign: "center", py: 3 }}>
					<Button
						variant="outlined"
						onClick={onLoadMore}
						sx={{ borderRadius: 999, fontWeight: 700 }}
					>
						Show more
					</Button>
				</Box>
			)}
			{filteredCount !== undefined && totalCount !== undefined && (
				<Typography
					variant="caption"
					sx={{
						display: "block",
						textAlign: "center",
						mt: 2,
						mb: 4,
						opacity: 0.6,
					}}
				>
					{filteredCount} of {totalCount} items
				</Typography>
			)}
		</>
	);

	return (
		<BaseLayout
			onRefresh={onRefresh}
			onOpenSettings={onOpenSettings}
			loading={loading}
			filteredCount={filteredCount}
			totalCount={totalCount}
			isOnline={isOnline}
			navItems={twitterConfig.sidebarNavItems}
			activeNav="home"
			onNavChange={(id) => {
				if (id === "home") onClearFilters();
			}}
			sources={sources}
			selectedSources={selectedSources}
			onSourcesChange={onSourcesChange}
			sourceSectionLabel={twitterConfig.sourceSectionLabel}
			showModeSwitcher={twitterConfig.showModeSwitcher}
			hideHeaderModeMenu={twitterConfig.hideHeaderModeMenu}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
		>
			<Box sx={{ maxWidth: "600px", width: "100%", pb: 4, pt: 2, px: 2 }}>
				{content}
			</Box>
		</BaseLayout>
	);
}
