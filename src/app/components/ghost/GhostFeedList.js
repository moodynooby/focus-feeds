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
import GhostFeedItem from "./GhostFeedItem";

export default function GhostFeedList({
	items,
	starredItems,
	onToggleStar,
	onSelectItem,
	loading,
}) {
	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<Box sx={{ p: 1, display: "flex", alignItems: "center", gap: 1 }}>
				<Checkbox size="small" />
				<IconButton size="small">
					<RefreshIcon fontSize="small" />
				</IconButton>
				<IconButton size="small">
					<MoreVertIcon fontSize="small" />
				</IconButton>
				<Box sx={{ flex: 1 }} />
				<Typography variant="caption" color="text.secondary">
					1-{items.length} of {items.length}
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
				{items.length === 0 && !loading && (
					<Box sx={{ p: 4, textAlign: "center" }}>
						<Typography variant="body1" color="text.secondary">
							No items found.
						</Typography>
					</Box>
				)}
				{items.map((item) => (
					<GhostFeedItem
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
