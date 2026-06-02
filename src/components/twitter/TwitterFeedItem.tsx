"use client";

import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import RepeatOutlinedIcon from "@mui/icons-material/RepeatOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import type { FeedItem } from "@/types";
import PodcastBadge from "../shared/PodcastBadge";
import { getHostname } from "../utils";

interface TwitterFeedItemProps {
	item: FeedItem;
}

export default function TwitterFeedItem({ item }: TwitterFeedItemProps) {
	const hostname = getHostname(item.link);
	const pubDate = new Date(item.pubDate);
	const timeAgo = formatDistanceToNow(pubDate, { addSuffix: false });

	// Format relative time (e.g., "2 hours" -> "2h", "3 minutes" -> "3m")
	const formatShortTime = (timeStr: string): string => {
		const match = timeStr.match(/^(\d+)\s*(\w+)/);
		if (!match) return timeStr;

		const num = match[1];
		const unit = match[2].toLowerCase();

		if (unit.startsWith("minute")) return `${num}m`;
		if (unit.startsWith("hour")) return `${num}h`;
		if (unit.startsWith("day")) return `${num}d`;
		if (unit.startsWith("week")) return `${num}w`;
		if (unit.startsWith("month")) return `${num}mo`;
		if (unit.startsWith("year")) return `${num}y`;

		return timeStr;
	};

	const shortTimeAgo = formatShortTime(timeAgo);

	return (
		<Paper
			elevation={0}
			sx={{
				mb: 1,
				p: 2,
				borderRadius: 2,
				bgcolor: "background.paper",
				border: "1px solid",
				borderColor: "divider",
				transition: "background-color 0.2s ease",
				"&:hover": {
					bgcolor: "action.hover",
					cursor: "pointer",
				},
			}}
		>
			<Box
				component="a"
				href={item.link}
				target="_blank"
				rel="noreferrer"
				sx={{
					textDecoration: "none",
					color: "inherit",
					display: "flex",
					width: "100%",
				}}
			>
				<Box sx={{ mr: 2, mt: 0.5 }}>
					<Avatar
						src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
						alt={item.source}
						sx={{
							width: 40,
							height: 40,
							bgcolor: "background.default",
							p: 0.5,
						}}
					>
						<Image
							src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
							alt={item.source}
							width={32}
							height={32}
							style={{ borderRadius: 4 }}
							unoptimized={false}
						/>
					</Avatar>
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							mb: 0.5,
						}}
					>
						<Typography
							variant="body2"
							sx={{
								fontWeight: 700,
								color: "text.primary",
								fontSize: "0.9rem",
							}}
						>
							@{hostname.replace("www.", "").split(".")[0]}
						</Typography>

						{item.isPodcast && <PodcastBadge />}

						<Typography
							variant="caption"
							sx={{
								color: "text.secondary",
								ml: "auto",
								fontSize: "0.75rem",
							}}
						>
							{shortTimeAgo}
						</Typography>
					</Box>

					<Typography
						component="h3"
						variant="body1"
						sx={{
							m: 0,
							mb: item.contentSnippet ? 0.5 : 0,
							fontWeight: 600,
							fontSize: "0.95rem",
							lineHeight: 1.3,
							color: "text.primary",
							textDecoration: "none",
							"&:hover": {
								color: "primary.main",
								textDecoration: "underline",
							},
						}}
					>
						{item.title}
					</Typography>

					{item.contentSnippet && (
						<Typography
							variant="body2"
							sx={{
								color: "text.secondary",
								fontSize: "0.875rem",
								lineHeight: 1.4,
								WebkitLineClamp: 2,
								display: "-webkit-box",
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{item.contentSnippet}
						</Typography>
					)}
				</Box>
			</Box>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 4,
					mt: 1,
					ml: "52px",
					color: "text.secondary",
					fontSize: "0.75rem",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 0.5,
						"&:hover": {
							color: "primary.main",
						},
					}}
				>
					<IconButton size="small" sx={{ p: 0, color: "inherit" }}>
						<ChatBubbleOutlineOutlinedIcon fontSize="small" />
					</IconButton>
				</Box>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 0.5,
						"&:hover": {
							color: "#00ba7c",
						},
					}}
				>
					<IconButton size="small" sx={{ p: 0, color: "inherit" }}>
						<RepeatOutlinedIcon fontSize="small" />
					</IconButton>
				</Box>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 0.5,
						"&:hover": {
							color: "#f91880",
						},
					}}
				>
					<IconButton size="small" sx={{ p: 0, color: "inherit" }}>
						<FavoriteBorderOutlinedIcon fontSize="small" />
					</IconButton>
				</Box>
			</Box>
		</Paper>
	);
}
