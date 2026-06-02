"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Headphones, Star } from "lucide-react";
import { memo } from "react";
import type { FeedItem } from "@/types";
import { formatDate } from "../utils";

interface GmailFeedItemProps {
	item: FeedItem;
	isStarred: boolean;
	onToggleStar: (id: string) => void;
	onClick: () => void;
}

function GmailFeedItem({
	item,
	isStarred,
	onToggleStar,
	onClick,
}: GmailFeedItemProps) {
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
				"&:hover": {
					bgcolor: "action.hover",
					zIndex: 1,
				},
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
						onToggleStar(item.guid || item.link);
					}}
					sx={{ p: 0.5, color: isStarred ? "#f4b400" : "text.secondary" }}
				>
					{isStarred ? <Star size={20} /> : <Star size={20} />}
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
				<Typography
					variant="body2"
					noWrap
					sx={{
						fontWeight: 700,
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
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
				<Typography
					variant="body2"
					noWrap
					sx={{
						fontWeight: 400,
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
				>
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

export default memo(GmailFeedItem);
