"use client";

import Box from "@mui/material/Box";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import { ghostTheme } from "../../ghost-theme";
import GhostArticleView from "./GhostArticleView";
import GhostFeedList from "./GhostFeedList";
import GhostHeader from "./GhostHeader";
import GhostSidebar from "./GhostSidebar";

export default function GhostLayout({
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
	view,
	onViewChange,
}) {
	const theme = useTheme();
	const mode = theme.palette.mode;
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
	const [selectedArticle, setSelectedArticle] = useState(null);

	return (
		<ThemeProvider theme={ghostTheme(mode)}>
			<Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
				<GhostHeader
					searchQuery={searchQuery}
					onSearchChange={onSearchChange}
					onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
					onOpenSettings={onOpenSettings}
					onSignOut={onSignOut}
					status={status}
				/>
				<GhostSidebar
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
						pt: "64px",
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
							<GhostArticleView
								item={selectedArticle}
								onBack={() => setSelectedArticle(null)}
							/>
						) : (
							<GhostFeedList
								items={items}
								starredItems={starredItems}
								onToggleStar={onToggleStar}
								onSelectItem={setSelectedArticle}
								loading={loading}
							/>
						)}
					</Box>
				</Box>
			</Box>
		</ThemeProvider>
	);
}
