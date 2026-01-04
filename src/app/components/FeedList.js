"use client";

import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FeedItem from "./FeedItem";
import PodcastItem from "./PodcastItem";

export default function FeedList({
    loading,
    error,
    failedFeeds,
    items,
    onRefresh,
}) {
    if (loading && items.length === 0) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
                <CircularProgress size={24} />
                <span>Loading feeds...</span>
            </Box>
        );
    }

    // Empty state
    if (!loading && items.length === 0 && !error) {
        return (
            <Box
                sx={{
                    textAlign: "center",
                    py: 8,
                    px: 2,
                    opacity: 0.7,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    No articles found
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                    Add some feed URLs in the "Feeds Manager" tab or refresh to get started.
                </Typography>
                <Button variant="outlined" onClick={onRefresh}>
                    Refresh Feeds
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {/* Error display */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>Error:</strong> {error}
                </Alert>
            )}

            {/* Partial failure warning */}
            {failedFeeds && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <strong>Some feeds failed to load:</strong>
                    <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.5rem" }}>
                        {failedFeeds.map((feed, idx) => (
                            <li key={idx}>
                                <strong>{feed.url}</strong>: {feed.error}
                            </li>
                        ))}
                    </ul>
                </Alert>
            )}

            {items.map((item, idx) =>
                item.isPodcast ? (
                    <PodcastItem key={idx} item={item} />
                ) : (
                    <FeedItem key={idx} item={item} />
                ),
            )}
        </Box>
    );
}
