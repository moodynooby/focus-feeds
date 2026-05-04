"use client";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DOMPurify from "isomorphic-dompurify";
import PodcastPlayer from "../PodcastPlayer";

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
						<ArrowBackOutlinedIcon />
					</IconButton>
				</Tooltip>
				<IconButton>
					<ArchiveOutlinedIcon fontSize="small" />
				</IconButton>
				<IconButton>
					<DeleteOutlinedIcon fontSize="small" />
				</IconButton>
				<IconButton>
					<MarkEmailUnreadOutlinedIcon fontSize="small" />
				</IconButton>
				<Box sx={{ flex: 1 }} />
				<Tooltip title="Open original">
					<IconButton component="a" href={item.link} target="_blank">
						<OpenInNewOutlinedIcon fontSize="small" />
					</IconButton>
				</Tooltip>
				<IconButton>
					<MoreVertOutlinedIcon fontSize="small" />
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
						fontSize: "1rem",
						color: "text.primary",
						"& img": {
							maxWidth: "100%",
							height: "auto",
							borderRadius: 1,
							my: 2,
						},
						"& a": { color: "primary.main", textDecoration: "none" },
						"& a:hover": { textDecoration: "underline" },
						"& p": { mb: 2 },
						"& ul, & ol": { mb: 2, pl: 4 },
						"& li": { mb: 1 },
						"& blockquote": {
							borderLeft: "4px solid",
							borderColor: "divider",
							pl: 2,
							ml: 0,
							my: 2,
							color: "text.secondary",
							fontStyle: "italic",
						},
						"& pre": {
							bgcolor: "action.hover",
							p: 2,
							borderRadius: 1,
							overflowX: "auto",
							fontFamily: "monospace",
							fontSize: "0.9rem",
							my: 2,
						},
					}}
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized with DOMPurify
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(item.content),
					}}
				/>
				{item.isPodcast && (
					<Box sx={{ mt: 4 }}>
						<PodcastPlayer
							audioUrl={item.audioUrl}
							audioType={item.audioType}
						/>
					</Box>
				)}
			</Box>
		</Paper>
	);
}
