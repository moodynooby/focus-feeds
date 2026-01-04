"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import PodcastPlayer from "./PodcastPlayer";

export default function PodcastItem({ item }) {
    // Safety check for hostname to prevent crashes
    let hostname = "";
    try {
        hostname = new URL(item.link).hostname;
    } catch (e) {
        hostname = "example.com";
    }

    // Format duration (e.g., "01:23:45" or "3600" seconds)
    const formatDuration = (duration) => {
        if (!duration) return null;
        // If already formatted (contains :), return as is
        if (String(duration).includes(":")) return duration;
        // Convert seconds to HH:MM:SS
        const secs = parseInt(duration, 10);
        if (isNaN(secs)) return duration;
        const hours = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const remainingSecs = secs % 60;
        if (hours > 0) {
            return `${hours}:${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
        }
        return `${mins}:${String(remainingSecs).padStart(2, "0")}`;
    };

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 2,
                p: 3,
                borderRadius: 2,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    borderColor: "rgba(168, 85, 247, 0.4)",
                    boxShadow: "0 4px 20px rgba(168, 85, 247, 0.15)",
                },
            }}
        >
            {/* Header: Source, Podcast Badge, Date */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1.5,
                }}
            >
                <Avatar
                    variant="rounded"
                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                    sx={{ width: 20, height: 20, bgcolor: "transparent" }}
                />
                <Box
                    component="span"
                    sx={{
                        fontWeight: 500,
                        fontSize: "0.85rem",
                        color: "text.secondary",
                    }}
                >
                    {item.source}
                </Box>
                {/* Podcast Badge */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: "rgba(168, 85, 247, 0.15)",
                        color: "#a855f7",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    <HeadphonesIcon sx={{ fontSize: 12 }} />
                    Podcast
                </Box>
                {/* Duration */}
                {item.duration && (
                    <Box
                        sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            fontFamily: "monospace",
                        }}
                    >
                        {formatDuration(item.duration)}
                    </Box>
                )}
                <Box
                    sx={{
                        ml: "auto",
                        fontSize: "0.75rem",
                        color: "text.secondary",
                    }}
                >
                    {new Date(item.pubDate).toLocaleDateString()}
                </Box>
            </Box>

            {/* Episode Title */}
            <Box component="h3" sx={{ m: 0, mb: 1 }}>
                <Box
                    component="a"
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                        textDecoration: "none",
                        color: "text.primary",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        lineHeight: 1.4,
                        "&:hover": { color: "#a855f7" },
                    }}
                >
                    {item.title}
                </Box>
            </Box>

            {/* Audio Player */}
            <PodcastPlayer audioUrl={item.audioUrl} audioType={item.audioType} />
        </Paper>
    );
}
