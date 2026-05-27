"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import EmptyState from "../EmptyState";
import SkeletonList from "../shared/SkeletonList";
import GmailFeedItem from "./GmailFeedItem";

export default function GmailFeedList({
	items,
	starredItems,
	onToggleStar,
	onSelectItem,
	loading,
	onRefresh,
}) {
	const showSkeleton = loading && items.length === 0;

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<Box sx={{ p: 1, display: "flex", alignItems: "center", gap: 1 }}>
				<Checkbox size="small" />
				<IconButton size="small" onClick={onRefresh}>
					<RefreshIcon fontSize="small" />
				</IconButton>
				<IconButton size="small">
					<MoreVertIcon fontSize="small" />
				</IconButton>
				<Box sx={{ flex: 1 }} />
				<Typography variant="caption" color="text.secondary">
					{items.length > 0 ? `1-${items.length}` : "0"} of {items.length}
				</Typography>
				<IconButton size="small">
					<ChevronLeftIcon fontSize="small" />
				</IconButton>
				<IconButton size="small">
					<ChevronRightIcon fontSize="small" />
				</IconButton>
			</Box>
			<Divider />
			<Box sx={{ flex: 1, overflow: "auto" }}>
				{showSkeleton && <SkeletonList variant="row" />}
				{!showSkeleton && items.length === 0 && (
					<EmptyState
						message="No items found."
						actionLabel="Refresh"
						onAction={onRefresh}
					/>
				)}
				{!showSkeleton &&
					items.map((item) => (
						<GmailFeedItem
							key={item.guid || item.link}
							item={item}
							isStarred={starredItems.includes(item.guid || item.link)}
							onToggleStar={onToggleStar}
							onClick={() => onSelectItem(item)}
						/>
					))}
			</Box>
		</Box>
	);
}
