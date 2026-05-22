"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import EmptyState from "./EmptyState";
import FeedItem from "./FeedItem";

export default function FeedList({
	loading,
	error,
	failedFeeds,
	items,
	onRefresh,
	hasMoreItems,
	onLoadMore,
	totalCount,
}) {
	if (loading && items.length === 0) {
		return (
			<Box
				sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
				suppressHydrationWarning
			>
				{[...Array(5)].map((_, i) => (
					<Paper
						key={`skeleton-${
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no unique id
							i
						}`}
						elevation={0}
						sx={{
							p: 2,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 2,
						}}
					>
						<Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
							<Skeleton variant="circular" width={40} height={40} />
							<Box sx={{ flex: 1 }}>
								<Skeleton variant="text" width="60%" height={24} />
								<Skeleton
									variant="text"
									width="40%"
									height={16}
									sx={{ mt: 0.5 }}
								/>
								<Skeleton
									variant="text"
									width="90%"
									height={60}
									sx={{ mt: 1 }}
								/>
							</Box>
						</Box>
					</Paper>
				))}
			</Box>
		);
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
