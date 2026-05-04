"use client";

import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export default function GhostFeedItem({
	item,
	isStarred,
	onToggleStar,
	onClick,
	isSelected,
}) {
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
				bgcolor: isSelected
					? (theme) => alpha(theme.palette.primary.main, 0.1)
					: "background.paper",
				cursor: "pointer",
				"&:hover": {
					boxShadow:
						"inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)",
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
					{isStarred ? (
						<StarOutlinedIcon fontSize="small" />
					) : (
						<StarBorderOutlinedIcon fontSize="small" />
					)}
				</IconButton>
			</Box>

			<Typography
				variant="body2"
				noWrap
				sx={{
					minWidth: 150,
					fontWeight: 700,
					overflow: "hidden",
					textOverflow: "ellipsis",
					mr: 2,
				}}
			>
				{item.source}
			</Typography>

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
				{new Date(item.pubDate).toLocaleDateString([], {
					month: "short",
					day: "numeric",
				})}
			</Typography>
		</Box>
	);
}
