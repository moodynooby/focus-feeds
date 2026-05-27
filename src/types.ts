export interface FeedItem {
	title: string;
	link: string;
	pubDate: string;
	content: string;
	contentSnippet: string;
	guid: string;
	source: string;
	feedTitle?: string;
	feedUrl: string;
	isPodcast: boolean;
	audioUrl: string | null;
	audioType: string | null;
	duration: string | null;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AppMode = "classic" | "gmail";

export type ViewMode = "inbox" | "starred";

export interface SyncStatus {
	loading: boolean;
	error: string | null;
	lastSync: number | null;
	info: Record<string, unknown> | SyncInfo | null;
}

export interface FailedFeed {
	url: string;
	error: string;
}

export type FeedDuration = "today" | "week" | "month";

export interface FeedSource {
	id: string;
	url: string;
}

export interface FetchFeedsResult {
	success: boolean;
	items: FeedItem[];
	failedFeeds?: FailedFeed[] | null;
	error?: string;
	timestamp?: number;
}

export interface SyncInfo {
	addedToDb: string[];
	pulledFromDb: string[];
	localCount: number;
	serverCount: number;
	finalCount: number;
	strategy: string;
}

export interface SyncFeedsResult {
	success: boolean;
	feeds?: FeedSource[];
	syncInfo?: SyncInfo;
	error?: string;
}

export interface AuthResult {
	success: boolean;
	user?: { id: string; createdAt: string };
	error?: string;
}

export interface UserFeedResult {
	success: boolean;
	feeds?: FeedSource[];
	error?: string;
}

export interface CheckAuthResult {
	authenticated: boolean;
	userId?: string;
}

export interface SimpleAuthResult {
	success: boolean;
	error?: string;
}
