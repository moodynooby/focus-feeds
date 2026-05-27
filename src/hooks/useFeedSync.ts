import { useEffect, useState } from "react";
import { syncFeeds } from "@/app/actions/feed-actions";
import type { AuthStatus, SyncInfo, SyncStatus } from "@/types";

interface UseFeedSyncProps {
	authStatus: AuthStatus;
	urls: string[];
	onUrlsChange: (urls: string[]) => void;
}

interface UseFeedSyncReturn {
	syncStatus: SyncStatus;
}

const initialSyncStatus: SyncStatus = {
	loading: false,
	error: null,
	lastSync: null,
	info: null,
};

export default function useFeedSync({
	authStatus,
	urls,
	onUrlsChange,
}: UseFeedSyncProps): UseFeedSyncReturn {
	const [syncStatus, setSyncStatus] = useState<SyncStatus>(initialSyncStatus);

	useEffect(() => {
		if (authStatus !== "authenticated") {
			return;
		}

		let cancelled = false;

		const performSync = async () => {
			setSyncStatus((prev) => ({ ...prev, loading: true, error: null }));

			try {
				const result = await syncFeeds(urls, { mergeStrategy: "merge" });

				if (cancelled) {
					return;
				}

				if (result.success) {
					const serverUrls = (result.feeds ?? []).map((f) => f.url);
					const hasChanged =
						JSON.stringify(serverUrls) !== JSON.stringify(urls);

					if (hasChanged) {
						onUrlsChange(serverUrls);
					}

					setSyncStatus({
						loading: false,
						error: null,
						lastSync: Date.now(),
						info: result.syncInfo ?? null,
					});
				} else {
					console.error("Failed to sync feeds:", result.error);
					setSyncStatus({
						loading: false,
						error: result.error ?? "Sync failed",
						lastSync: null,
						info: null,
					});
				}
			} catch (error) {
				if (cancelled) {
					return;
				}

				console.error("Sync error:", error);
				setSyncStatus({
					loading: false,
					error: "Unexpected error during sync",
					lastSync: null,
					info: null,
				});
			}
		};

		performSync();

		return () => {
			cancelled = true;
		};
	}, [authStatus, urls, onUrlsChange]);

	return { syncStatus };
}
