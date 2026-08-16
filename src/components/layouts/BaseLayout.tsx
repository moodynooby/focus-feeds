"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { ReactNode } from "react";
import FeedSidebar, {
	type NavItem,
} from "@/components/feed-sidebar/FeedSidebar";
import AppHeader from "@/components/header/AppHeader";
import OfflineBanner from "@/components/shared/OfflineBanner";

export interface BaseLayoutProps {
	/** Optional page title shown in the app header. */
	title?: string;
	/** Show the search field in the header (with source filter on classic). */
	headerSearch?: boolean;
	searchQuery?: string;
	onSearchChange?: (value: string) => void;
	/** Inline source filter node (classic mode). Sidebar modes pass sources below. */
	sourceFilter?: ReactNode;
	onRefresh: () => void;
	onOpenSettings: () => void;
	onClearFilters?: () => void;
	filteredCount?: number;
	totalCount?: number;
	loading?: boolean;
	isOnline?: boolean;

	/** Sidebar navigation items (e.g. Inbox/Starred). Hide sidebar entirely when empty. */
	navItems?: NavItem[];
	activeNav?: string;
	onNavChange?: (id: string) => void;
	/** Source list used by the sidebar (gmail/twitter modes). */
	sources?: string[];
	selectedSources?: string[];
	onSourcesChange?: (sources: string[]) => void;
	/** Label above the sources list in the sidebar. */
	sourceSectionLabel?: string;
	/** Show the app-mode switcher in the sidebar. */
	showModeSwitcher?: boolean;
	/** Show the add-feed button in the sidebar. */
	onAddFeed?: () => void;
	/** Hide the mode-switch menu in the header (twitter mode). */
	hideHeaderModeMenu?: boolean;
	/** Extra nodes appended to the header's action area (e.g. a profile menu). */
	rightSlot?: ReactNode;

	/** Page content rendered in the main area (each mode supplies its own list). */
	children: ReactNode;
}

/**
 * Single extensible layout shell used by every app mode.
 *
 * Modes differ only in *content* (their list/article view) and small chrome
 * tweaks (search, sidebar nav, source labels). Anything shared — the header,
 * sidebar, offline banner, and main-area wrapper — lives here, so adding a
 * new mode requires only a mode config plus a content component.
 */
export default function BaseLayout({
	title,
	headerSearch = true,
	searchQuery,
	onSearchChange,
	sourceFilter,
	onRefresh,
	onOpenSettings,
	onClearFilters,
	filteredCount,
	totalCount,
	loading = false,
	isOnline = true,
	navItems,
	activeNav,
	onNavChange,
	sources,
	selectedSources,
	onSourcesChange,
	sourceSectionLabel,
	showModeSwitcher = false,
	onAddFeed,
	hideHeaderModeMenu = false,
	rightSlot,
	children,
}: BaseLayoutProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const hasSidebar = Boolean(navItems && navItems.length > 0);

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
				title={title}
				searchQuery={headerSearch ? searchQuery : undefined}
				onSearchChange={headerSearch ? onSearchChange : undefined}
				sourceFilter={sourceFilter}
				onRefresh={onRefresh}
				onOpenSettings={onOpenSettings}
				onClearFilters={onClearFilters}
				filteredCount={filteredCount}
				totalCount={totalCount}
				loading={loading}
				hideModeMenu={hideHeaderModeMenu}
				rightSlot={rightSlot}
			/>

			{hasSidebar && navItems && onNavChange && (
				<FeedSidebar
					open
					onClose={() => {}}
					isMobile={isMobile}
					searchQuery={searchQuery}
					onSearchChange={onSearchChange}
					navItems={navItems}
					activeNav={activeNav ?? navItems[0]?.id ?? ""}
					onNavChange={onNavChange}
					showModeSwitcher={showModeSwitcher}
					sources={sources ?? []}
					selectedSources={selectedSources ?? []}
					onSourcesChange={onSourcesChange ?? (() => {})}
					onAddFeed={onAddFeed}
					sourceSectionLabel={sourceSectionLabel ?? "Sources"}
				/>
			)}

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					height: "100%",
					overflow: "auto",
					bgcolor: "background.default",
				}}
			>
				{children}
			</Box>
		</Box>
	);
}
