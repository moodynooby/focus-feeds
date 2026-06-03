"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Home, Menu as MenuIcon } from "lucide-react";
import { useState } from "react";
import TwitterFeedItem from "@/features/feeds/components/TwitterFeedItem";
import type { FeedItem } from "@/types";
import EmptyState from "../EmptyState";
import FeedSidebar from "../feed-sidebar/FeedSidebar";
import AppHeader from "../header/AppHeader";
import OfflineBanner from "../shared/OfflineBanner";
import SkeletonList from "../shared/SkeletonList";

interface TwitterLayoutProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	sources: string[];
	selectedSources: string[];
	onSourcesChange: (sources: string[]) => void;
	items: FeedItem[];
	loading: boolean;
	onRefresh: () => void;
	onOpenSettings: () => void;
	onClearFilters: () => void;
	filteredCount?: number;
	totalCount?: number;
	error?: string;
	hasMoreItems?: boolean;
	onLoadMore?: () => void;
	isOnline?: boolean;
}

export default function TwitterLayout({
	searchQuery,
	onSearchChange,
	sources,
	selectedSources,
	onSourcesChange,
	items,
	loading,
	onRefresh,
	onOpenSettings,
	onClearFilters,
	filteredCount,
	totalCount,
	error,
	hasMoreItems,
	onLoadMore,
	isOnline = true,
}: TwitterLayoutProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
	const [activeNav, setActiveNav] = useState("home");

	const navItems = [{ id: "home", label: "Home", icon: <Home size={20} /> }];

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
				onRefresh={onRefresh}
				onOpenSettings={onOpenSettings}
				onClearFilters={onClearFilters}
				filteredCount={filteredCount}
				totalCount={totalCount}
				loading={loading}
				leftSlot={
					<IconButton
						edge="start"
						color="inherit"
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						<MenuIcon size={24} />
					</IconButton>
				}
			/>

			<FeedSidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				isMobile={isMobile}
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				navItems={navItems}
				activeNav={activeNav}
				onNavChange={(id) => {
					setActiveNav(id);
					if (id === "home") {
						onClearFilters();
					}
					if (isMobile) setSidebarOpen(false);
				}}
				showModeSwitcher
				sources={sources}
				selectedSources={selectedSources}
				onSourcesChange={onSourcesChange}
				sourceSectionLabel="Accounts you follow"
			/>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					height: "100%",
					overflow: "auto",
					display: "flex",
					justifyContent: "center",
				}}
			>
				<Box
					sx={{
						maxWidth: "600px",
						width: "100%",
						pb: 4,
						pt: 2,
						px: 2,
					}}
				>
					{loading && items.length === 0 ? (
						<SkeletonList rows={10} />
					) : error ? (
						<EmptyState
							message="Error loading feeds"
							actionLabel={error ? "Retry" : undefined}
							onAction={onRefresh}
						/>
					) : items.length === 0 ? (
						<EmptyState
							message="No articles found"
							actionLabel="Adjust filters"
							onAction={onRefresh}
						/>
					) : (
						<>
							{items.map((item) => (
								<TwitterFeedItem key={item.guid || item.link} item={item} />
							))}

							{hasMoreItems && (
								<Box
									sx={{
										textAlign: "center",
										py: 3,
									}}
								>
									<Button
										variant="outlined"
										onClick={onLoadMore}
										sx={{
											borderRadius: 999,
											fontWeight: 700,
										}}
									>
										Show more
									</Button>
								</Box>
							)}
						</>
					)}
				</Box>
			</Box>
		</Box>
	);
}
