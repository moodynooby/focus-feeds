"use client";

import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

export default function GhostArticleView({ item, onBack }) {
	if (!item) return null;

	return (
		<Paper
			elevation={0}
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.paper",
				borderRadius: 0,
			}}
		>
			<Box sx={{ p: 1, display: "flex", alignItems: "center", gap: 1 }}>
				<Tooltip title="Back to Inbox">
					<IconButton onClick={onBack}>
						<ArrowBackIcon />
					</IconButton>
				</Tooltip>
				<IconButton>
					<ArchiveIcon fontSize="small" />
				</IconButton>
				<IconButton>
					<DeleteIcon fontSize="small" />
				</IconButton>
				<IconButton>
					<MarkEmailUnreadIcon fontSize="small" />
				</IconButton>
				<Box sx={{ flex: 1 }} />
				<Tooltip title="Open original">
					<IconButton component="a" href={item.link} target="_blank">
						<OpenInNewIcon fontSize="small" />
					</IconButton>
				</Tooltip>
				<IconButton>
					<MoreVertIcon fontSize="small" />
				</IconButton>
			</Box>
			<Divider />
			<Box sx={{ p: 3, flex: 1, overflow: "auto" }}>
				<Typography variant="h5" sx={{ mb: 3, fontWeight: 400 }}>
					{item.title}
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: "50%",
							bgcolor: "primary.main",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "white",
						}}
					>
						{item.source?.[0] || "U"}
					</Box>
					<Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
							{item.source}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							to me
						</Typography>
					</Box>
					<Box sx={{ ml: "auto", textAlign: "right" }}>
						<Typography variant="caption" color="text.secondary">
							{new Date(item.pubDate).toLocaleString()}
						</Typography>
					</Box>
				</Box>
				<Box
					sx={{
						lineHeight: 1.6,
						"& img": { maxWidth: "100%", height: "auto" },
						"& a": { color: "primary.main" },
					}}
					dangerouslySetInnerHTML={{ __html: item.content }}
				/>
			</Box>
		</Paper>
	);
}
