"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import {
	Download,
	Link,
	PlusCircle,
	RefreshCw,
	Settings,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import SignIn from "@/features/auth/components/signIn";
import type { InstallStatus } from "@/hooks/usePWAInstall";
import type { AuthStatus, SyncStatus } from "@/types";

interface SettingsDrawerProps {
	open: boolean;
	onClose: () => void;
	urls: string[];
	onAdd: (url: string) => void;
	onRemove: (url: string) => void;
	itemsCount: number;
	lastRefresh: Date | null;
	onRefresh: () => void;
	onClearCache: () => void;
	duration: string;
	onDurationChange: (duration: string) => void;
	syncStatus: SyncStatus;
	status: AuthStatus;
	onSignOut: () => void;
	deferredPrompt: Event | null;
	onInstall: () => void;
	installStatus: InstallStatus;
}

export default function SettingsDrawer({
	open,
	onClose,
	urls,
	onAdd,
	onRemove,
	itemsCount,
	lastRefresh,
	onRefresh,
	onClearCache,
	duration,
	onDurationChange,
	syncStatus,
	status,
	onSignOut,
	deferredPrompt,
	onInstall,
	installStatus = "available",
}: SettingsDrawerProps) {
	const [activeTab, setActiveTab] = useState(0);
	const [newUrl, setNewUrl] = useState("");

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const handleAdd = () => {
		if (newUrl.trim()) {
			onAdd(newUrl.trim());
			setNewUrl("");
		}
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			slotProps={{
				paper: {
					sx: {
						width: { xs: "100%", sm: "480px" },
						bgcolor: "background.default",
					},
				},
			}}
		>
			<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: 2,
						borderBottom: "1px solid",
						borderColor: "divider",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Settings size={24} />
						<Typography variant="h6" sx={{ fontWeight: 600 }}>
							Settings
						</Typography>
					</Box>
					<IconButton onClick={onClose} size="small">
						<X size={24} />
					</IconButton>
				</Box>

				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					variant="fullWidth"
					sx={{
						borderBottom: "1px solid",
						borderColor: "divider",
						"& .MuiTab-root": {
							textTransform: "none",
							fontWeight: 500,
						},
					}}
				>
					<Tab label="Feeds Manager" />
					<Tab label="Settings" />
				</Tabs>

				<Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
					{activeTab === 0 && (
						<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							<Paper
								variant="outlined"
								sx={{
									p: 2,
									display: "flex",
									flexDirection: "column",
									gap: 2,
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<PlusCircle size={20} />
									<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
										Add Feed
									</Typography>
								</Box>
								<Box sx={{ display: "flex", gap: 1 }}>
									<Input
										placeholder="https://example.com/feed.xml"
										value={newUrl}
										onChange={(e) => setNewUrl(e.target.value)}
										onKeyDown={(e: React.KeyboardEvent) =>
											e.key === "Enter" && handleAdd()
										}
										sx={{ flex: 1 }}
										startAdornment={<Link size={18} />}
									/>
									<Button variant="contained" onClick={handleAdd} size="small">
										Add
									</Button>
								</Box>
							</Paper>

							<Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 600,
										mb: 2,
										display: "flex",
										alignItems: "center",
										gap: 1,
									}}
								>
									<Box
										sx={{
											width: 8,
											height: 8,
											borderRadius: "50%",
											bgcolor: "primary.main",
										}}
									/>
									Your Feeds ({urls.length})
								</Typography>

								{urls.length === 0 ? (
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ textAlign: "center", py: 4 }}
									>
										No feeds added yet. Add a feed URL above.
									</Typography>
								) : (
									<Box
										sx={{ display: "flex", flexDirection: "column", gap: 1 }}
									>
										{urls.map((url) => (
											<Paper
												key={url}
												variant="outlined"
												sx={{
													p: 1.5,
													display: "flex",
													alignItems: "center",
													gap: 1,
												}}
											>
												<Link size={16} />
												<Typography
													variant="body2"
													sx={{
														flex: 1,
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													}}
												>
													{url}
												</Typography>
												<IconButton
													size="small"
													onClick={() => onRemove(url)}
													sx={{ color: "error.main" }}
												>
													<Trash2 size={20} />
												</IconButton>
											</Paper>
										))}
									</Box>
								)}
							</Box>
						</Box>
					)}

					{activeTab === 1 && (
						<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							<Paper variant="outlined" sx={{ p: 2 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
									Feed Status
								</Typography>
								<Box
									sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
								>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<Typography variant="body2" color="text.secondary">
											Articles loaded
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 500 }}>
											{itemsCount}
										</Typography>
									</Box>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<Typography variant="body2" color="text.secondary">
											Last refresh
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 500 }}>
											{lastRefresh
												? lastRefresh.toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})
												: "Never"}
										</Typography>
									</Box>
									<Box sx={{ display: "flex", gap: 1, mt: 1 }}>
										<Button
											variant="outlined"
											size="small"
											onClick={onRefresh}
											startIcon={<RefreshCw size={20} />}
											sx={{ flex: 1 }}
										>
											Refresh
										</Button>
										<Button
											variant="outlined"
											size="small"
											onClick={onClearCache}
											sx={{ flex: 1 }}
										>
											Clear Cache
										</Button>
									</Box>
								</Box>
							</Paper>

							<Paper variant="outlined" sx={{ p: 2 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
									Time Range
								</Typography>
								<ToggleButtonGroup
									value={duration}
									exclusive
									onChange={(_, newDuration: string | null) =>
										newDuration && onDurationChange(newDuration)
									}
									fullWidth
									size="small"
								>
									<ToggleButton value="today">Today</ToggleButton>
									<ToggleButton value="week">Week</ToggleButton>
									<ToggleButton value="month">Month</ToggleButton>
								</ToggleButtonGroup>
							</Paper>

							<Paper variant="outlined" sx={{ p: 2 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
									Account
								</Typography>
								{status === "authenticated" ? (
									<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
										<Typography variant="body2" sx={{ flex: 1 }}>
											Signed in as user
										</Typography>
										<Button
											variant="outlined"
											size="small"
											onClick={onSignOut}
											color="error"
										>
											Sign Out
										</Button>
									</Box>
								) : (
									<SignIn />
								)}
								{syncStatus?.loading && (
									<Typography
										variant="caption"
										color="primary"
										sx={{ mt: 1, display: "block" }}
									>
										Syncing...
									</Typography>
								)}
								{syncStatus?.error && (
									<Typography
										variant="caption"
										color="error"
										sx={{ mt: 1, display: "block" }}
									>
										Sync error: {syncStatus.error}
									</Typography>
								)}
							</Paper>

							{(deferredPrompt || installStatus !== "installed") && (
								<Paper variant="outlined" sx={{ p: 2 }}>
									<Typography
										variant="subtitle2"
										sx={{ fontWeight: 600, mb: 2 }}
									>
										Install App
									</Typography>
									{installStatus === "installed" ? (
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 2 }}
										>
											Focus Feeds is installed on your device.
										</Typography>
									) : (
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 2 }}
										>
											Install Focus Feeds on your device for quick access.
										</Typography>
									)}
									{deferredPrompt && (
										<Button
											variant="contained"
											fullWidth
											onClick={onInstall}
											startIcon={<Download size={20} />}
										>
											Install
										</Button>
									)}
									{!deferredPrompt && installStatus === "dismissed" && (
										<Typography variant="caption" color="text.secondary">
											You dismissed the install prompt. Refresh the page to try
											again.
										</Typography>
									)}
								</Paper>
							)}
						</Box>
					)}
				</Box>
			</Box>
		</Drawer>
	);
}
