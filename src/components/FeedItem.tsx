"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import { PODCAST_ACCENT, PODCAST_ACCENT_RGB } from "@/lib/theme";
import type { FeedItem as FeedItemType } from "@/types";
import PodcastPlayer from "./PodcastPlayer";
import PodcastBadge from "./shared/PodcastBadge";
import { formatDate, formatDuration, getHostname } from "./utils";

interface FeedItemProps {
	item: FeedItemType;
}

export default function FeedItem({ item }: FeedItemProps) {
	const theme = useTheme();
	const hostname = getHostname(item.link);

	const podcastHover = {
		borderColor: `rgba(${PODCAST_ACCENT_RGB}, 0.4)`,
		boxShadow: `0 4px 20px rgba(${PODCAST_ACCENT_RGB}, 0.15)`,
	};

	const defaultHover = {
		transform: "translateY(-2px)",
		borderColor:
			theme.palette.mode === "dark"
				? "rgba(255, 255, 255, 0.2)"
				: "rgba(0, 0, 0, 0.15)",
		boxShadow:
			theme.palette.mode === "dark"
				? "0 4px 12px rgba(0, 0, 0, 0.2)"
				: "0 4px 12px rgba(0, 0, 0, 0.08)",
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
				"&:hover": item.isPodcast ? podcastHover : defaultHover,
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					mb: 1.5,
				}}
			>
				<Image
					src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
					alt={item.source}
					width={20}
					height={20}
					style={{ borderRadius: 4 }}
					unoptimized={false}
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

				{item.isPodcast && <PodcastBadge />}

				{item.isPodcast && item.duration && (
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
					{formatDate(item.pubDate)}
				</Box>
			</Box>

			<Box component="h3" sx={{ m: 0, mb: item.isPodcast ? 1 : 0 }}>
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
						"&:hover": {
							color: item.isPodcast ? PODCAST_ACCENT : "primary.main",
						},
					}}
				>
					{item.title}
				</Box>
			</Box>

			{item.isPodcast && (
				<PodcastPlayer
					audioUrl={item.audioUrl}
					audioType={item.audioType ?? undefined}
				/>
			)}
		</Paper>
	);
}
