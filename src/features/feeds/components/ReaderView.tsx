"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { FetchFullArticleResult } from "@/app/actions";
import PodcastPlayer from "@/components/PodcastPlayer";
import RSSContent from "@/features/feeds/components/RSSContent";
import { articleContentStyles } from "@/lib/styles";
import { formatDate, getHostname } from "@/lib/utils";
import type { FeedItem } from "@/types";

interface ReaderViewProps {
	item: FeedItem;
	onClose: () => void;
	fetchFullArticle: (
		url: string,
	) => Promise<FetchFullArticleResult | { error: string }>;
}

export default function ReaderView({
	item,
	onClose,
	fetchFullArticle,
}: ReaderViewProps) {
	const [enhancedContent, setEnhancedContent] =
		useState<FetchFullArticleResult | null>(null);
	const [enhancedLoading, setEnhancedLoading] = useState(false);
	const [enhancedError, setEnhancedError] = useState<string | null>(null);

	const hostname = getHostname(item.link);

	useEffect(() => {
		setEnhancedContent(null);
		setEnhancedError(null);
		setEnhancedLoading(true);

		fetchFullArticle(item.link)
			.then((result) => {
				if ("error" in result) {
					setEnhancedError(result.error);
				} else {
					setEnhancedContent(result);
				}
			})
			.catch(() => {
				setEnhancedError("Failed to load full article");
			})
			.finally(() => {
				setEnhancedLoading(false);
			});
	}, [item.link, fetchFullArticle]);

	const displayContent = enhancedContent?.content || item.content;
	const displayTitle = enhancedContent?.title || item.title;
	const displayByline = enhancedContent?.byline;
	const displaySiteName = enhancedContent?.siteName;

	return (
		<Dialog
			fullScreen
			open
			onClose={onClose}
			aria-labelledby="reader-view-title"
			slotProps={{
				paper: {
					sx: {
						bgcolor: "background.default",
					},
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
				}}
			>
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						px: 2,
						py: 1,
						borderBottom: "1px solid",
						borderColor: "divider",
						gap: 1,
					}}
				>
					<Tooltip title="Back">
						<IconButton onClick={onClose} edge="start">
							<ArrowLeft size={24} />
						</IconButton>
					</Tooltip>
					<Box
						sx={{
							flex: 1,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: 600,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{item.title}
						</Typography>
					</Box>
					{enhancedLoading && <CircularProgress size={20} />}
					<Tooltip title="Open original">
						<IconButton
							component="a"
							href={item.link}
							target="_blank"
							rel="noreferrer"
							size="small"
						>
							<ExternalLink size={20} />
						</IconButton>
					</Tooltip>
				</Box>

				{/* Content */}
				<Box
					sx={{
						flex: 1,
						overflow: "auto",
					}}
				>
					<Box
						sx={{
							maxWidth: "720px",
							mx: "auto",
							px: { xs: 3, md: 4 },
							py: { xs: 3, md: 5 },
						}}
					>
						{/* Site name and byline */}
						{(displaySiteName || displayByline) && (
							<Box sx={{ mb: 2 }}>
								{displaySiteName && (
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
									>
										{displaySiteName}
									</Typography>
								)}
								{displayByline && (
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 0.5 }}
									>
										By {displayByline}
									</Typography>
								)}
							</Box>
						)}

						{/* Title */}
						<Typography
							variant="h3"
							component="h1"
							id="reader-view-title"
							sx={{
								fontWeight: 700,
								lineHeight: 1.2,
								mb: 2,
								fontSize: { xs: "1.75rem", md: "2.25rem" },
							}}
						>
							{displayTitle}
						</Typography>

						{/* Metadata */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1.5,
								mb: 4,
								flexWrap: "wrap",
							}}
						>
							<Box
								component="span"
								sx={{
									fontSize: "0.875rem",
									color: "text.secondary",
									fontWeight: 500,
								}}
							>
								{item.source}
							</Box>
							<Box
								component="span"
								sx={{
									width: 4,
									height: 4,
									borderRadius: "50%",
									bgcolor: "text.secondary",
									opacity: 0.5,
								}}
							/>
							<Typography variant="caption" color="text.secondary">
								{formatDate(item.pubDate, "long")}
							</Typography>
							{hostname && (
								<>
									<Box
										component="span"
										sx={{
											width: 4,
											height: 4,
											borderRadius: "50%",
											bgcolor: "text.secondary",
											opacity: 0.5,
										}}
									/>
									<Typography variant="caption" color="text.secondary">
										{hostname}
									</Typography>
								</>
							)}
						</Box>

						<Divider sx={{ mb: 4 }} />

						{/* Enhancement notice */}
						{enhancedLoading && (
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mb: 2, fontStyle: "italic" }}
							>
								Loading full article content...
							</Typography>
						)}
						{enhancedError && !enhancedContent && (
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ mb: 2, fontStyle: "italic" }}
							>
								Showing RSS excerpt (full article unavailable: {enhancedError})
							</Typography>
						)}

						{/* Article content */}
						<RSSContent
							content={DOMPurify.sanitize(displayContent)}
							sx={articleContentStyles}
						/>

						{/* Podcast player */}
						{item.isPodcast && (
							<Box sx={{ mt: 4, mb: 2 }}>
								<Divider sx={{ mb: 3 }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
									Podcast Episode
								</Typography>
								<PodcastPlayer
									audioUrl={item.audioUrl}
									audioType={item.audioType ?? undefined}
								/>
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		</Dialog>
	);
}
