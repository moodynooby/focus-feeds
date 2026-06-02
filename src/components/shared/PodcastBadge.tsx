"use client";

import Box from "@mui/material/Box";
import { Headphones } from "lucide-react";
import { PODCAST_ACCENT, PODCAST_ACCENT_RGB } from "@/lib/theme";

interface PodcastBadgeProps {
	iconSize?: number;
}

export default function PodcastBadge({ iconSize = 12 }: PodcastBadgeProps) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 0.5,
				px: 1,
				py: 0.25,
				borderRadius: 1,
				bgcolor: `rgba(${PODCAST_ACCENT_RGB}, 0.15)`,
				color: PODCAST_ACCENT,
				fontSize: "0.7rem",
				fontWeight: 600,
				textTransform: "uppercase",
				letterSpacing: "0.5px",
			}}
		>
			<Headphones size={iconSize} />
			Podcast
		</Box>
	);
}
