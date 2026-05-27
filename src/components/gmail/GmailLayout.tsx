"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import type { AuthStatus, FeedItem, ViewMode } from "@/types";
import OfflineBanner from "../shared/OfflineBanner";
import GmailArticleView from "./GmailArticleView";
import GmailFeedList from "./GmailFeedList";
import GmailHeader from "./GmailHeader";
import GmailSidebar from "./GmailSidebar";

interface GmailLayoutProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	sources: string[];
	selectedSources: string[];
	onSourcesChange: (sources: string[]) => void;
	items: FeedItem[];
	starredItems: string[];
	onToggleStar: (id: string) => void;
	onOpenSettings: () => void;
	onSignOut: () => void;
	status: AuthStatus;
	loading: boolean;
	onAddFeed: () => void;
	onRefresh: () => void;
	view: ViewMode;
	onViewChange: (view: ViewMode) => void;
	isOnline?: boolean;
}

export default function GmailLayout({
	searchQuery,
	onSearchChange,
	sources,
	selectedSources,
	onSourcesChange,
	items,
	starredItems,
	onToggleStar,
	onOpenSettings,
	onSignOut,
	status,
	loading,
	onAddFeed,
	onRefresh,
	view,
	onViewChange,
	isOnline = true,
}: GmailLayoutProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
	const [selectedArticle, setSelectedArticle] = useState<FeedItem | null>(null);

	return (
		<Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
			{!isOnline && <OfflineBanner variant="fixed" />}
			<GmailHeader
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				onOpenSettings={onOpenSettings}
				onSignOut={onSignOut}
				status={status}
			/>
			<GmailSidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				sources={sources}
				selectedSources={selectedSources}
				onSourcesChange={onSourcesChange}
				view={view}
				onViewChange={(v) => {
					onViewChange(v);
					setSelectedArticle(null);
					if (isMobile) setSidebarOpen(false);
				}}
				onAddFeed={onAddFeed}
				isMobile={isMobile}
			/>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					pt: isOnline ? "64px" : "112px",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					bgcolor: "background.default",
					transition: (theme) =>
						theme.transitions.create("margin", {
							easing: theme.transitions.easing.sharp,
							duration: theme.transitions.duration.leavingScreen,
						}),
				}}
			>
				<Box
					sx={{
						m: 2,
						ml: 0,
						flex: 1,
						bgcolor: "background.paper",
						borderRadius: 4,
						overflow: "hidden",
						border: (theme) =>
							theme.palette.mode === "dark" ? "none" : "1px solid #e0e2e0",
					}}
				>
					{selectedArticle ? (
						<GmailArticleView
							item={selectedArticle}
							onBack={() => setSelectedArticle(null)}
						/>
					) : (
						<GmailFeedList
							items={items}
							starredItems={starredItems}
							onToggleStar={onToggleStar}
							onSelectItem={setSelectedArticle}
							loading={loading}
							onRefresh={onRefresh}
						/>
					)}
				</Box>
			</Box>
		</Box>
	);
}
