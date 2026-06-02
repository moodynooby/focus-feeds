"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DOMPurify from "isomorphic-dompurify";
import {
	Archive,
	ArrowLeft,
	ExternalLink,
	MailOpen,
	MoreVertical,
	Trash2,
} from "lucide-react";
import type { FeedItem } from "@/types";
import PodcastPlayer from "../PodcastPlayer";
import RSSContent from "../RSSContent";
import { formatDate } from "../utils";

interface GmailArticleViewProps {
	item: FeedItem;
	onBack: () => void;
}

export default function GmailArticleView({
	item,
	onBack,
}: GmailArticleViewProps) {
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
						<ArrowLeft size={24} />
					</IconButton>
				</Tooltip>
				<IconButton>
					<Archive size={20} />
				</IconButton>
				<IconButton>
					<Trash2 size={20} />
				</IconButton>
				<IconButton>
					<MailOpen size={20} />
				</IconButton>
				<Box sx={{ flex: 1 }} />
				<Tooltip title="Open original">
					<IconButton component="a" href={item.link} target="_blank">
						<ExternalLink size={20} />
					</IconButton>
				</Tooltip>
				<IconButton>
					<MoreVertical size={20} />
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
							color: "primary.contrastText",
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
							{formatDate(item.pubDate, "long")}
						</Typography>
					</Box>
				</Box>
				<RSSContent
					content={DOMPurify.sanitize(item.content)}
					sx={{
						lineHeight: 1.6,
						fontSize: "1rem",
						color: "text.primary",
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
				/>
				{item.isPodcast && (
					<Box sx={{ mt: 4 }}>
						<PodcastPlayer
							audioUrl={item.audioUrl}
							audioType={item.audioType ?? undefined}
						/>
					</Box>
				)}
			</Box>
		</Paper>
	);
}
