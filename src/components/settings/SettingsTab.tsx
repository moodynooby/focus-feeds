"use client";

import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { ColorModeContext } from "@/lib/theme";
import type { AuthStatus, SyncStatus } from "@/types";
import SignIn from "../signIn";
import InstallSection from "./InstallSection";

interface SettingsTabProps {
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
	installStatus: string;
}

export default function SettingsTab({
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
	installStatus,
}: SettingsTabProps) {
	const colorMode = useContext(ColorModeContext);

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Paper variant="outlined" sx={{ p: 2 }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
					Feed Status
				</Typography>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
							startIcon={<RefreshIcon />}
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

			<InstallSection
				deferredPrompt={deferredPrompt}
				onInstall={onInstall}
				installStatus={installStatus}
			/>

			<Paper variant="outlined" sx={{ p: 2 }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
					Appearance
				</Typography>
				<ToggleButtonGroup
					value={colorMode ? "light" : "dark"}
					exclusive
					onChange={() => colorMode?.toggleColorMode()}
					fullWidth
					size="small"
				>
					<ToggleButton value="light">Light</ToggleButton>
					<ToggleButton value="dark">Dark</ToggleButton>
				</ToggleButtonGroup>
			</Paper>
		</Box>
	);
}
