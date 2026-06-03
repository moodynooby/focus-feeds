"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Inbox, Menu as MenuIcon, Star } from "lucide-react";
import { useState } from "react";
import GmailArticleView from "@/features/feeds/components/GmailArticleView";
import GmailFeedList from "@/features/feeds/components/GmailFeedList";
import type { AuthStatus, FeedItem, ViewMode } from "@/types";
import FeedSidebar from "../feed-sidebar/FeedSidebar";
import AppHeader from "../header/AppHeader";
import OfflineBanner from "../shared/OfflineBanner";

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
	const [anchorElProfile, setAnchorElProfile] = useState<HTMLElement | null>(
		null,
	);

	const handleOpenProfile = (event: React.MouseEvent<HTMLElement>) =>
		setAnchorElProfile(event.currentTarget);
	const handleCloseProfile = () => setAnchorElProfile(null);

	const navItems = [
		{ id: "inbox", label: "Inbox", icon: <Inbox size={20} /> },
		{ id: "starred", label: "Starred", icon: <Star size={20} /> },
	];

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

	return (
		<Box
			sx={{
				display: "flex",
				height: "100vh",
				overflow: "hidden",
				pt: "64px",
			}}
		>
			{!isOnline && <OfflineBanner variant="fixed" />}
			<AppHeader
				fixed
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				onRefresh={onRefresh}
				onOpenSettings={onOpenSettings}
				leftSlot={
					<IconButton
						edge="start"
						color="inherit"
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						<MenuIcon size={24} />
					</IconButton>
				}
				rightSlot={rightSlot}
			/>
			<FeedSidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				isMobile={isMobile}
				navItems={navItems}
				activeNav={view}
				onNavChange={(id) => {
					onViewChange(id as ViewMode);
					setSelectedArticle(null);
					if (isMobile) setSidebarOpen(false);
				}}
				sources={sources}
				selectedSources={selectedSources}
				onSourcesChange={onSourcesChange}
				onAddFeed={onAddFeed}
				sourceSectionLabel="Labels"
			/>
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					height: "100%",
					display: "flex",
					flexDirection: "column",
					bgcolor: "background.default",
					transition: (t) =>
						t.transitions.create("margin", {
							easing: t.transitions.easing.sharp,
							duration: t.transitions.duration.leavingScreen,
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
