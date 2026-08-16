"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { formatDistanceToNow } from "date-fns";
import { Headphones, Heart, MessageSquare, Repeat, Star } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import PodcastPlayer from "@/components/PodcastPlayer";
import PodcastBadge from "@/components/shared/PodcastBadge";
import { PODCAST_ACCENT, PODCAST_ACCENT_RGB } from "@/lib/theme";
import { formatDate, formatDuration, getHostname } from "@/lib/utils";
import type { FeedItem } from "@/types";

export type FeedItemVariant = "classic" | "twitter" | "gmail";

interface FeedItemRendererProps {
	item: FeedItem;
	variant: FeedItemVariant;
	// Classic props
	readerMode?: boolean;
	onOpenReader?: (item: FeedItem) => void;
	// Gmail props
	isStarred?: boolean;
	onToggleStar?: (id: string) => void;
	onClick?: () => void;
}

/**
 * Unified renderer for feed items across all app modes.
 * Consolidates metadata parsing, formatting, and variant-specific layouts.
 */
function FeedItemRenderer({
	item,
	variant,
	readerMode = false,
	onOpenReader,
	isStarred = false,
	onToggleStar,
	onClick,
}: FeedItemRendererProps) {
	const hostname = getHostname(item.link);
	const pubDate = new Date(item.pubDate);

	// Shared metadata components
	const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

	if (variant === "gmail") {
		return (
			<Box
				onClick={onClick}
				sx={{
					display: "flex",
					alignItems: "center",
					px: 2,
					py: 0.25,
					height: 40,
					borderBottom: "1px solid",
					borderColor: "divider",
					bgcolor: "background.paper",
					cursor: "pointer",
					"&:hover": { bgcolor: "action.hover", zIndex: 1 },
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", minWidth: 80 }}>
					<Checkbox
						size="small"
						sx={{ p: 0.5 }}
						onClick={(e) => e.stopPropagation()}
					/>
					<IconButton
						size="small"
						onClick={(e) => {
							e.stopPropagation();
							onToggleStar?.(item.guid || item.link);
						}}
						sx={{ p: 0.5, color: isStarred ? "#f4b400" : "text.secondary" }}
					>
						<Star size={20} />
					</IconButton>
				</Box>
				<Box
					sx={{
						minWidth: 150,
						display: "flex",
						alignItems: "center",
						gap: 1,
						mr: 2,
					}}
				>
					{item.isPodcast && <Headphones size={16} />}
					<Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
						{item.source}
					</Typography>
				</Box>
				<Box
					sx={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						gap: 1,
						overflow: "hidden",
					}}
				>
					<Typography variant="body2" noWrap sx={{ fontWeight: 400 }}>
						{item.title}
					</Typography>
				</Box>
				<Typography
					variant="caption"
					sx={{ minWidth: 60, textAlign: "right", fontWeight: 700, ml: 2 }}
				>
					{formatDate(item.pubDate, "short")}
				</Typography>
			</Box>
		);
	}

	if (variant === "twitter") {
		const timeAgo = formatDistanceToNow(pubDate, { addSuffix: false });
		const shortTime = timeAgo
			.replace(" minutes", "m")
			.replace(" minute", "m")
			.replace(" hours", "h")
			.replace(" hour", "h")
			.replace(" days", "d")
			.replace(" day", "d")
			.replace(" weeks", "w")
			.replace(" week", "w")
			.replace(" months", "mo")
			.replace(" month", "mo")
			.replace(" years", "y")
			.replace(" year", "y");

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
					"&:hover": { bgcolor: "action.hover", cursor: "pointer" },
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
							src={faviconUrl}
							alt={item.source}
							sx={{ width: 40, height: 40, bgcolor: "background.default" }}
						/>
					</Box>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Box
							sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
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
								{shortTime}
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
					}}
				>
					<IconButton
						size="small"
						sx={{
							p: 0,
							color: "inherit",
							"&:hover": { color: "primary.main" },
						}}
					>
						<MessageSquare size={20} />
					</IconButton>
					<IconButton
						size="small"
						sx={{ p: 0, color: "inherit", "&:hover": { color: "#00ba7c" } }}
					>
						<Repeat size={20} />
					</IconButton>
					<IconButton
						size="small"
						sx={{ p: 0, color: "inherit", "&:hover": { color: "#f91880" } }}
					>
						<Heart size={20} />
					</IconButton>
				</Box>
			</Paper>
		);
	}

	// Default: Classic variant
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
									? "0 4px 12px rgba(0,0,0,0.4)"
									: "0 4px 12px rgba(0,0,0,0.08)",
				},
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
				<Image
					src={faviconUrl}
					alt={item.source}
					width={20}
					height={20}
					style={{ borderRadius: 4 }}
				/>
				<Box
					component="span"
					sx={{ fontWeight: 500, fontSize: "0.85rem", color: "text.secondary" }}
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
				<Box sx={{ ml: "auto", fontSize: "0.75rem", color: "text.secondary" }}>
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

export default memo(FeedItemRenderer);
