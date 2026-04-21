"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import SettingsIcon from "@mui/icons-material/Settings";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import { useCallback, useEffect, useRef, useState } from "react";
import { addUserFeed, fetchFeeds, removeUserFeed, syncFeeds } from "./actions";
import AddFeed from "./components/AddFeed";
import FeedList from "./components/FeedList";
import Settings from "./components/Settings";

function useSimpleSession() {
	const [session, setSession] = useState(null);
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await fetch("/api/auth", {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					if (data.authenticated) {
						setSession({ user: { id: data.userId } });
						setStatus("authenticated");
					} else {
						setSession(null);
						setStatus("unauthenticated");
					}
				} else {
					setSession(null);
					setStatus("unauthenticated");
				}
			} catch {
				setSession(null);
				setStatus("unauthenticated");
			}
		};

		checkSession();
	}, []);

	return { data: session, status };
}

export default function FeedManager() {
	const { data: session, status } = useSimpleSession();
	const [value, setValue] = useState("1");
	const [urls, setUrls] = useState([]);
	const [initLoadDone, setInitLoadDone] = useState(false);
	const [duration, setDuration] = useState("week");

	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [failedFeeds, setFailedFeeds] = useState(null);
	const [lastRefresh, setLastRefresh] = useState(null);
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [syncStatus, setSyncStatus] = useState({
		loading: false,
		error: null,
		lastSync: null,
		info: null,
	});

	useEffect(() => {
		const handleBeforeInstallPrompt = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setDeferredPrompt(null);
		}
	};

	useEffect(() => {
		if (typeof window === "undefined") return;

		if (status === "loading") return;

		const loadInitialData = async () => {
			let loadedUrls = [];
			let loadedDuration = "week";

			if (status === "authenticated") {
				const localSavedUrls = localStorage.getItem("focusFeedsUrls");
				let localFeeds = [];
				if (localSavedUrls) {
					try {
						const parsed = JSON.parse(localSavedUrls);
						if (Array.isArray(parsed)) localFeeds = parsed;
					} catch (_e) {}
				}

				setSyncStatus((prev) => ({ ...prev, loading: true, error: null }));
				const result = await syncFeeds(localFeeds, { mergeStrategy: "merge" });

				if (result.success) {
					loadedUrls = result.feeds.map((f) => f.url);
					setSyncStatus({
						loading: false,
						error: null,
						lastSync: Date.now(),
						info: result.syncInfo,
					});
				} else {
					console.error("Failed to sync/load user feeds", result.error);
					setSyncStatus({
						loading: false,
						error: result.error,
						lastSync: null,
						info: null,
					});
				}

				const savedDuration = localStorage.getItem("focusFeedsDuration");
				if (savedDuration) loadedDuration = savedDuration;
			} else {
				const savedUrls = localStorage.getItem("focusFeedsUrls");
				if (savedUrls) {
					try {
						const parsed = JSON.parse(savedUrls);
						if (Array.isArray(parsed)) {
							loadedUrls = parsed;
						}
					} catch (e) {
						console.error("Failed to parse saved feeds", e);
					}
				} else {
					loadedUrls = [
						"https://hnrss.org/frontpage",
						"https://feeds.megaphone.fm/vergecast",
					];
				}

				const savedDuration = localStorage.getItem("focusFeedsDuration");
				if (savedDuration) {
					loadedDuration = savedDuration;
				}
			}

			setUrls(loadedUrls);
			setDuration(loadedDuration);
			setInitLoadDone(true);
		};

		loadInitialData();
	}, [status]);

	useEffect(() => {
		if (initLoadDone && status === "unauthenticated") {
			localStorage.setItem("focusFeedsUrls", JSON.stringify(urls));
			localStorage.setItem("focusFeedsDuration", duration);
		}
		if (initLoadDone) {
			localStorage.setItem("focusFeedsDuration", duration);
		}
	}, [urls, duration, initLoadDone, status]);

	const cacheRef = useRef(new Map());
	const CACHE_DURATION = 5 * 60 * 1000;
	const abortControllerRef = useRef(null);

	const loadFeeds = useCallback(
		async (forceRefresh = false) => {
			if (!initLoadDone) return;
			if (urls.length === 0 && initLoadDone) {
				setItems([]);
				setLoading(false);
				return;
			}

			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			abortControllerRef.current = new AbortController();

			const cacheKey = `${urls.sort().join(",")}|${duration}`;
			const cached = cacheRef.current.get(cacheKey);

			if (
				!forceRefresh &&
				cached &&
				Date.now() - cached.timestamp < CACHE_DURATION
			) {
				setItems(cached.items);
				setFailedFeeds(cached.failedFeeds);
				setLastRefresh(new Date(cached.timestamp));
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);
			setFailedFeeds(null);

			if (urls.length === 0) {
				setItems([]);
				setLoading(false);
				return;
			}

			try {
				const response = await fetchFeeds(urls, duration);

				if (abortControllerRef.current?.signal.aborted) {
					return;
				}

				if (response.success) {
					cacheRef.current.set(cacheKey, {
						items: response.items,
						failedFeeds: response.failedFeeds,
						timestamp: response.timestamp,
					});

					setItems(response.items);
					setFailedFeeds(response.failedFeeds);
					setLastRefresh(new Date(response.timestamp));
				} else {
					setError(response.error);
					setItems([]);
				}
			} catch (err) {
				if (err.name !== "AbortError") {
					setError("Network error: Failed to connect to server");
					console.error("Client error:", err);
				}
			} finally {
				setLoading(false);
			}
		},
		[urls, initLoadDone, duration],
	);

	useEffect(() => {
		if (initLoadDone) {
			loadFeeds();
		}

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [loadFeeds, initLoadDone]);

	const handleRemove = async (urlToRemove) => {
		setUrls((prev) => prev.filter((url) => url !== urlToRemove));

		if (status === "authenticated") {
			const result = await removeUserFeed(urlToRemove);
			if (!result.success) {
				console.error("Failed to remove feed remotely");
			}
		}
	};

	const handleAdd = async (newUrl) => {
		if (newUrl && !urls.includes(newUrl)) {
			setUrls((prev) => [...prev, newUrl]);
			setValue("1");

			if (status === "authenticated") {
				const result = await addUserFeed(newUrl);
				if (!result.success) {
					console.error("Failed to add feed remotely");
				}
			}
		}
	};

	const handleChange = (_event, newValue) => {
		setValue(newValue);
	};

	const handleSignOut = async () => {
		try {
			await fetch("/api/auth", {
				method: "DELETE",
				credentials: "include",
			});
			window.location.reload();
		} catch (error) {
			console.error("Failed to sign out:", error);
		}
	};

	const handleSync = async () => {
		if (status !== "authenticated") return;

		setSyncStatus((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const result = await syncFeeds(urls, { mergeStrategy: "merge" });

			if (result.success) {
				setUrls(result.feeds.map((f) => f.url));
				setSyncStatus({
					loading: false,
					error: null,
					lastSync: Date.now(),
					info: result.syncInfo,
				});
			} else {
				setSyncStatus({
					loading: false,
					error: result.error,
					lastSync: syncStatus.lastSync,
					info: null,
				});
			}
		} catch (_err) {
			setSyncStatus({
				loading: false,
				error: "Sync failed",
				lastSync: syncStatus.lastSync,
				info: null,
			});
		}
	};

	const clearCache = () => {
		cacheRef.current.clear();
		loadFeeds(true);
	};

	return (
		<Box sx={{ maxWidth: "800px", mx: "auto", p: 4 }}>
			<TabContext value={value}>
				<TabList
					onChange={handleChange}
					variant="scrollable"
					scrollButtons="auto"
					sx={{
						maxWidth: "100%",
						mb: 2,
						"& .MuiTabs-scroller": {
							overflowX: "auto !important",
							"&::-webkit-scrollbar": { display: "none" },
							msOverflowStyle: "none",
							scrollbarWidth: "none",
						},
					}}
				>
					<Tab
						icon={<RssFeedIcon />}
						iconPosition="start"
						label="Focus Feeds"
						value="1"
					/>
					<Tab
						icon={<AddCircleIcon />}
						iconPosition="start"
						label="Feeds Manager"
						value="2"
					/>
					<Tab
						icon={<SettingsIcon />}
						iconPosition="start"
						label="Settings"
						value="3"
					/>
				</TabList>

				<TabPanel value="1" sx={{ px: 0 }}>
					<FeedList
						loading={loading}
						error={error}
						failedFeeds={failedFeeds}
						items={items}
						onRefresh={() => loadFeeds(true)}
					/>
				</TabPanel>

				<TabPanel value="2" sx={{ px: 0 }}>
					<AddFeed urls={urls} onAdd={handleAdd} onRemove={handleRemove} />
				</TabPanel>

				<TabPanel value="3" sx={{ px: 0 }}>
					<Settings
						deferredPrompt={deferredPrompt}
						onInstall={handleInstallClick}
						loading={loading}
						itemsCount={items.length}
						lastRefresh={lastRefresh}
						onRefresh={() => loadFeeds(true)}
						onClearCache={clearCache}
						duration={duration}
						onDurationChange={setDuration}
						syncStatus={syncStatus}
						onSync={handleSync}
						session={session}
						status={status}
						onSignOut={handleSignOut}
					/>
				</TabPanel>
			</TabContext>
		</Box>
	);
}
