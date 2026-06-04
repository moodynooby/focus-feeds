"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import { memo } from "react";
import PodcastPlayer from "@/components/PodcastPlayer";
import PodcastBadge from "@/components/shared/PodcastBadge";
import { PODCAST_ACCENT, PODCAST_ACCENT_RGB } from "@/lib/theme";
import { formatDate, formatDuration, getHostname } from "@/lib/utils";
import type { FeedItem as FeedItemType } from "@/types";

interface FeedItemProps {
	item: FeedItemType;
	readerMode?: boolean;
	onOpenReader?: (item: FeedItemType) => void;
}

function FeedItem({ item, readerMode = false, onOpenReader }: FeedItemProps) {
	const hostname = getHostname(item.link);

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
					transform: "translateY(-2px)",
					borderColor: item.isPodcast
						? `rgba(${PODCAST_ACCENT_RGB}, 0.4)`
						: "text.secondary",
					boxShadow: item.isPodcast
						? `0 4px 20px rgba(${PODCAST_ACCENT_RGB}, 0.15)`
						: (theme) =>
								theme.palette.mode === "dark"
									? "0 4px 12px rgba(0, 0, 0, 0.4)"
									: "0 4px 12px rgba(0, 0, 0, 0.08)",
				},
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
					href={readerMode ? "#" : item.link}
					target={readerMode ? undefined : "_blank"}
					rel={readerMode ? undefined : "noreferrer"}
					onClick={(e: React.MouseEvent) => {
						if (readerMode) {
							e.preventDefault();
							onOpenReader?.(item);
						}
					}}
					sx={{
						textDecoration: "none",
						color: "text.primary",
						fontSize: "1.1rem",
						fontWeight: 600,
						lineHeight: 1.4,
						cursor: "pointer",
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

export default memo(FeedItem);
