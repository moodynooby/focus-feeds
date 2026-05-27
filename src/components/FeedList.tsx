"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { FailedFeed, FeedItem as FeedItemType } from "@/types";
import EmptyState from "./EmptyState";
import FeedItem from "./FeedItem";
import SkeletonList from "./shared/SkeletonList";

interface FeedListProps {
	loading: boolean;
	error?: string;
	failedFeeds?: FailedFeed[] | null;
	items: FeedItemType[];
	onRefresh: () => void;
	hasMoreItems?: boolean;
	onLoadMore?: () => void;
	totalCount?: number;
}

export default function FeedList({
	loading,
	error,
	failedFeeds,
	items,
	onRefresh,
	hasMoreItems,
	onLoadMore,
	totalCount,
}: FeedListProps) {
	if (loading && items.length === 0) {
		return <SkeletonList />;
	}

	if (!loading && items.length === 0 && !error) {
		return (
			<EmptyState
				message="No articles found. Add some feed URLs or refresh to get started."
				actionLabel="Refresh Feeds"
				onAction={onRefresh}
			/>
		);
	}

	return (
		<Box>
			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					<strong>Error:</strong> {error}
				</Alert>
			)}

			{failedFeeds && (
				<Alert severity="warning" sx={{ mb: 2 }}>
					<strong>Some feeds failed to load:</strong>
					<ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem" }}>
						{failedFeeds.map((feed) => (
							<li key={feed.url}>
								<strong>{feed.url}</strong>: {feed.error}
							</li>
						))}
					</ul>
				</Alert>
			)}

			{items.map((item) => (
				<FeedItem key={item.guid || item.link} item={item} />
			))}

			{hasMoreItems && (
				<Box sx={{ mt: 3, textAlign: "center" }}>
					<Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
						Showing {items.length} of {totalCount} items
					</Typography>
					<Button
						variant="outlined"
						onClick={onLoadMore}
						disabled={loading}
						fullWidth
						sx={{ maxWidth: 300, mx: "auto" }}
					>
						{loading ? "Loading..." : "Load More"}
					</Button>
				</Box>
			)}
		</Box>
	);
}
