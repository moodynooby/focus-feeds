import type { LucideIcon } from "lucide-react";
import { Hash, Inbox, Mail, Sparkles, Star } from "lucide-react";
import type { NavItem } from "@/components/feed-sidebar/FeedSidebar";
import type { AppMode } from "@/types";

export interface ModeConfig {
	/** Display name shown in the mode switcher. */
	name: string;
	icon: LucideIcon;
	/** Sidebar nav items rendered in this mode (empty = no sidebar). */
	sidebarNavItems: NavItem[];
	/** Label above the sources list in the sidebar. */
	sourceSectionLabel: string;
	/** Show the mode switcher inside the sidebar. */
	showModeSwitcher: boolean;
	/** Show the add-feed button in the sidebar. */
	showAddFeedInSidebar: boolean;
	/** Render a header source-filter bar inline (classic) vs sidebar-only filtering. */
	showHeaderSourceFilter: boolean;
	/** Hide the mode-switch menu in the header. */
	hideHeaderModeMenu: boolean;
	/** Feature flags for content-area capabilities. */
	hasInlineArticleView: boolean;
	hasStarring: boolean;
}

const inboxNav: NavItem[] = [
	{ id: "inbox", label: "Inbox", icon: <Inbox size={20} /> },
	{ id: "starred", label: "Starred", icon: <Star size={20} /> },
];

export const MODE_CONFIG: Record<AppMode, ModeConfig> = {
	classic: {
		name: "Classic",
		icon: Sparkles,
		sidebarNavItems: [],
		sourceSectionLabel: "Sources",
		showModeSwitcher: false,
		showAddFeedInSidebar: false,
		showHeaderSourceFilter: true,
		hideHeaderModeMenu: false,
		hasInlineArticleView: false,
		hasStarring: false,
	},
	gmail: {
		name: "Gmail",
		icon: Mail,
		sidebarNavItems: inboxNav,
		sourceSectionLabel: "Labels",
		showModeSwitcher: true,
		showAddFeedInSidebar: true,
		showHeaderSourceFilter: false,
		hideHeaderModeMenu: false,
		hasInlineArticleView: true,
		hasStarring: true,
	},
	twitter: {
		name: "Twitter",
		icon: Hash,
		sidebarNavItems: [{ id: "home", label: "Home", icon: <Inbox size={20} /> }],
		sourceSectionLabel: "Accounts you follow",
		showModeSwitcher: true,
		showAddFeedInSidebar: false,
		showHeaderSourceFilter: false,
		hideHeaderModeMenu: true,
		hasInlineArticleView: false,
		hasStarring: false,
	},
};

export const MODE_NAMES = Object.keys(MODE_CONFIG) as AppMode[];
