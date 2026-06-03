import { useEffect, useRef, useState } from "react";
import { syncFeeds } from "@/app/actions";
import type { AuthStatus, SyncStatus } from "@/types";

interface UseFeedSyncReturn {
	syncStatus: SyncStatus;
}

export default function useFeedSync(
	status: AuthStatus,
	urls: string[],
	setUrls: (urls: string[] | ((prev: string[]) => string[])) => void,
): UseFeedSyncReturn {
	const [syncStatus, setSyncStatus] = useState<SyncStatus>({
		loading: false,
		error: null,
		lastSync: null,
		info: null,
	});

	const hasSyncedRef = useRef(false);
	const urlsRef = useRef(urls);
	urlsRef.current = urls;

	useEffect(() => {
		if (status !== "authenticated" || hasSyncedRef.current) return;
		hasSyncedRef.current = true;

		const syncUserFeeds = async () => {
			const currentUrls = urlsRef.current;
			setSyncStatus((prev) => ({ ...prev, loading: true, error: null }));
			const result = await syncFeeds(currentUrls, { mergeStrategy: "merge" });

			if (result.success) {
				const serverUrls = (result.feeds ?? []).map((f) => f.url);
				if (JSON.stringify(serverUrls) !== JSON.stringify(currentUrls)) {
					setUrls(serverUrls);
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
					error: result.error ?? null,
					lastSync: null,
					info: null,
				});
			}
		};

		syncUserFeeds();
	}, [status, setUrls]);

	return { syncStatus };
}
