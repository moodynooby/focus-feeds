"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {
	ChevronLeft,
	ChevronRight,
	MoreVertical,
	RefreshCw,
} from "lucide-react";
import { useMemo } from "react";
import EmptyState from "@/components/EmptyState";
import SkeletonList from "@/components/shared/SkeletonList";
import type { FeedItem } from "@/types";
import FeedItemRenderer from "./FeedItemRenderer";

interface GmailFeedListProps {
	items: FeedItem[];
	starredItems: string[];
	onToggleStar: (id: string) => void;
	onSelectItem: (item: FeedItem) => void;
	loading: boolean;
	onRefresh: () => void;
}

export default function GmailFeedList({
	items,
	starredItems,
	onToggleStar,
	onSelectItem,
	loading,
	onRefresh,
}: GmailFeedListProps) {
	const showSkeleton = loading && items.length === 0;

	const starredSet = useMemo(() => new Set(starredItems), [starredItems]);

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<Box sx={{ p: 1, display: "flex", alignItems: "center", gap: 1 }}>
				<Checkbox size="small" />
				<IconButton size="small" onClick={onRefresh}>
					<RefreshCw size={20} />
				</IconButton>
				<IconButton size="small">
					<MoreVertical size={20} />
				</IconButton>
				<Box sx={{ flex: 1 }} />
				<Typography variant="caption" color="text.secondary">
					{items.length > 0 ? `1-${items.length}` : "0"} of {items.length}
				</Typography>
				<IconButton size="small">
					<ChevronLeft size={20} />
				</IconButton>
				<IconButton size="small">
					<ChevronRight size={20} />
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
						<FeedItemRenderer
							key={item.guid || item.link}
							item={item}
							variant="gmail"
							isStarred={starredSet.has(item.guid || item.link)}
							onToggleStar={onToggleStar}
							onClick={() => onSelectItem(item)}
						/>
					))}
			</Box>
		</Box>
	);
}
