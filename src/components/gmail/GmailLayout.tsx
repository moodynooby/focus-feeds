"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import BaseLayout from "@/components/layouts/BaseLayout";
import GmailArticleView from "@/features/feeds/components/GmailArticleView";
import GmailFeedList from "@/features/feeds/components/GmailFeedList";
import { MODE_CONFIG } from "@/lib/modes";
import type { AuthStatus, FeedItem, ViewMode } from "@/types";

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

const gmailConfig = MODE_CONFIG.gmail;

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
	const [selectedArticle, setSelectedArticle] = useState<FeedItem | null>(null);
	const [anchorElProfile, setAnchorElProfile] = useState<HTMLElement | null>(
		null,
	);

	const handleOpenProfile = (event: React.MouseEvent<HTMLElement>) =>
		setAnchorElProfile(event.currentTarget);
	const handleCloseProfile = () => setAnchorElProfile(null);

	const rightSlot = (
		<>
			<IconButton onClick={handleOpenProfile} sx={{ p: 0.5 }}>
				<Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
					U
				</Avatar>
			</IconButton>
			<Menu
				anchorEl={anchorElProfile}
				open={Boolean(anchorElProfile)}
				onClose={handleCloseProfile}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<Box sx={{ p: 2, textAlign: "center" }}>
					<Avatar
						sx={{
							width: 64,
							height: 64,
							mx: "auto",
							mb: 1,
							bgcolor: "primary.main",
						}}
					>
						U
					</Avatar>
					<Typography variant="subtitle1">User</Typography>
					<Typography variant="body2" color="text.secondary">
						{status === "authenticated" ? "Authenticated" : "Guest"}
					</Typography>
				</Box>
				<MenuItem
					onClick={() => {
						handleCloseProfile();
						onSignOut();
					}}
				>
					Sign Out
				</MenuItem>
			</Menu>
		</>
	);

	const content = selectedArticle ? (
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
	);

	return (
		<BaseLayout
			onRefresh={onRefresh}
			onOpenSettings={onOpenSettings}
			loading={loading}
			isOnline={isOnline}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			navItems={gmailConfig.sidebarNavItems}
			activeNav={view}
			onNavChange={(id) => {
				onViewChange(id as ViewMode);
				setSelectedArticle(null);
			}}
			sources={sources}
			selectedSources={selectedSources}
			onSourcesChange={onSourcesChange}
			sourceSectionLabel={gmailConfig.sourceSectionLabel}
			showModeSwitcher={gmailConfig.showModeSwitcher}
			onAddFeed={onAddFeed}
			rightSlot={rightSlot}
		>
			<Box
				sx={{
					m: 2,
					flex: 1,
					bgcolor: "background.paper",
					borderRadius: 4,
					overflow: "hidden",
					height: "calc(100% - 16px)",
				}}
			>
				{content}
			</Box>
		</BaseLayout>
	);
}
