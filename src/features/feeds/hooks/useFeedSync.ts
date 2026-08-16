import { useCallback, useEffect, useRef, useState } from "react";
import { getUserFeeds, syncFeeds } from "@/app/actions";
import type { AuthStatus, SyncStatus } from "@/types";

interface UseFeedSyncOptions {
	/** Current auth status from useAuth. */
	status: AuthStatus;
	/** Feed URLs currently stored locally (from the page's localStorage state). */
	urls: string[];
	/** Write the merged/synced URL list back to the local store. */
	setUrls: (urls: string[] | ((prev: string[]) => string[])) => void;
}

interface UseFeedSyncReturn {
	syncStatus: SyncStatus;
	/** Report a remote-mirror error (e.g. from add/remove feed actions). */
	markSyncError: (error: string) => void;
}

/**
 * Simple, deterministic feed sync: the local feed list (localStorage) is the
 * source of truth. The remote account store is only mirrored at auth
 * transition boundaries, never during normal browsing — so there is no race
 * with default-feed seeding and no silent overwrite of local state.
 *
 * - When the user signs in:      pull the remote list and union-merge it into
 *                                the local list (remote adds are adopted,
 *                                nothing local is ever removed).
 * - When the user signs out:     push the local list to the remote store so
 *                                the account reflects the last state.
 *
 * Ordinary feed add/remove stays localStorage-first; the actions in
 * `handleAdd`/`handleRemove` mirror changes to the remote store opportunistically
 * and failures are reported through `syncStatus.error`.
 */
export default function useFeedSync({
	status,
	urls,
	setUrls,
}: UseFeedSyncOptions & { status: AuthStatus }): UseFeedSyncReturn {
	const [syncStatus, setSyncStatus] = useState<SyncStatus>({
		loading: false,
		error: null,
		lastSync: null,
		info: null,
	});

	const urlsRef = useRef(urls);
	urlsRef.current = urls;

	const pullFeeds = useCallback(async () => {
		setSyncStatus((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const result = await getUserFeeds();
			if (!result.success || !result.feeds) {
				setSyncStatus({
					loading: false,
					error: result.error ?? "Failed to load account feeds",
					lastSync: null,
					info: null,
				});
				return;
			}
			const remoteUrls = result.feeds.map((f) => f.url);
			// Union merge: adopt remote feeds that aren't local yet, keep
			// everything the user already has locally. Order = local first.
			const localSet = new Set(urlsRef.current);
			const merged = [
				...urlsRef.current,
				...remoteUrls.filter((url) => !localSet.has(url)),
			];
			if (remoteUrls.length > 0) {
				setUrls(merged);
			}
			setSyncStatus({
				loading: false,
				error: null,
				lastSync: Date.now(),
				info: {
					localCount: urlsRef.current.length,
					serverCount: remoteUrls.length,
					finalCount: merged.length,
					pulledFromDb: remoteUrls.filter((url) => !localSet.has(url)),
					addedToDb: [],
					strategy: "pull",
				},
			});
		} catch {
			setSyncStatus({
				loading: false,
				error: "Failed to pull account feeds",
				lastSync: null,
				info: null,
			});
		}
	}, [setUrls]);

	const pushFeeds = useCallback(async () => {
		// Best-effort: sign-out shouldn't block just because the mirror fails.
		try {
			await syncFeeds(urlsRef.current, { mergeStrategy: "push" });
		} catch {
			// Mirror failure is non-fatal for sign-out.
		}
	}, []);

	const markSyncError = useCallback(
		(error: string) =>
			setSyncStatus((prev) => ({ ...prev, error, lastSync: null, info: null })),
		[],
	);

	// Sync on auth transitions only (not on mount with every render).
	useEffect(() => {
		if (status === "loading") return;

		// pullFeeds / pushFeeds are stable callbacks that always read the
		// latest urls via urlsRef, so running on every status change
		// (sign-in, sign-out) covers both transitions without a race.
		if (status === "authenticated") {
			void pullFeeds();
		} else if (status === "unauthenticated") {
			void pushFeeds();
		}
	}, [status, pullFeeds, pushFeeds]);

	return { syncStatus, markSyncError };
}
