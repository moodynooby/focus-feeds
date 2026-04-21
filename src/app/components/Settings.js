"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import DownloadIcon from "@mui/icons-material/Download";
import LightModeIcon from "@mui/icons-material/LightMode";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { ColorModeContext } from "../theme";
import SignIn from "./signIn";

export default function Settings({
	deferredPrompt,
	onInstall,
	loading,
	itemsCount,
	lastRefresh,
	onRefresh,
	onClearCache,
	duration,
	onDurationChange,
	syncStatus,
	onSync,
	status,
	onSignOut,
}) {
	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);

	const formatRefreshTime = () => {
		if (!lastRefresh) return "";
		const now = Date.now();
		const diff = now - lastRefresh.getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return "just now";
		if (minutes === 1) return "1 minute ago";
		if (minutes < 60) return `${minutes} minutes ago`;
		return lastRefresh.toLocaleTimeString();
	};

	const handleDurationChange = (_event, newDuration) => {
		if (newDuration !== null) {
			onDurationChange(newDuration);
		}
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				{" "}
				<Paper
					elevation={0}
					sx={{
						p: 3,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: 2,
					}}
				>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
						<Typography
							variant="h6"
							sx={{ fontSize: "1.1rem", fontWeight: 700 }}
						>
							Account
						</Typography>
						{status === "authenticated" ? (
							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
								<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
									<Box>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											Sync Enabled
										</Typography>
										<Typography
											variant="body2"
											sx={{ color: "text.secondary" }}
										>
											Your feeds are synced across devices
										</Typography>
									</Box>
									<Button
										variant="outlined"
										color="primary"
										onClick={onSignOut}
									>
										Sign Out
									</Button>
								</Box>
								{syncStatus && (
									<Box
										sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
									>
										<Typography
											variant="body2"
											sx={{ color: "text.secondary" }}
										>
											Sync Status:{" "}
											{syncStatus.loading ? (
												<Box
													component="span"
													sx={{
														display: "inline-flex",
														alignItems: "center",
														gap: 0.5,
													}}
												>
													<CircularProgress size={12} />
													Syncing...
												</Box>
											) : syncStatus.error ? (
												<Box component="span" sx={{ color: "error.main" }}>
													Error: {syncStatus.error}
												</Box>
											) : syncStatus.lastSync ? (
												<Box component="span" sx={{ color: "success.main" }}>
													Last synced:{" "}
													{new Date(syncStatus.lastSync).toLocaleTimeString()}
													{syncStatus.info &&
														` (${syncStatus.info.finalCount} feeds)`}
												</Box>
											) : (
												"Not synced yet"
											)}
										</Typography>
										{onSync && (
											<Button
												variant="outlined"
												size="small"
												onClick={onSync}
												disabled={syncStatus?.loading}
												startIcon={
													syncStatus?.loading ? (
														<CircularProgress size={14} />
													) : (
														<RefreshIcon />
													)
												}
												sx={{ width: "fit-content" }}
											>
												{syncStatus?.loading ? "Syncing..." : "Sync Now"}
											</Button>
										)}
									</Box>
								)}
							</Box>
						) : (
							<SignIn />
						)}
					</Box>
				</Paper>
			</Box>

			{}
			<Paper
				elevation={0}
				sx={{
					p: 3,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 2,
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: 2,
					}}
				>
					<Box>
						<Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
							Feed Duration
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Limit items to a specific time range
						</Typography>
					</Box>
					<ToggleButtonGroup
						value={duration}
						exclusive
						onChange={handleDurationChange}
						aria-label="feed duration"
						size="small"
						sx={{
							"& .MuiToggleButton-root": {
								textTransform: "capitalize",
								px: 2,
							},
						}}
					>
						<ToggleButton value="today">Today</ToggleButton>
						<ToggleButton value="week">Week</ToggleButton>
						<ToggleButton value="month">Month</ToggleButton>
						<ToggleButton value="all">All</ToggleButton>
					</ToggleButtonGroup>
				</Box>
			</Paper>

			{}
			<Paper
				elevation={0}
				sx={{
					p: 3,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 2,
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Box>
						<Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
							Appearance
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Switch between dark and light mode
						</Typography>
					</Box>
					<IconButton
						onClick={colorMode.toggleColorMode}
						sx={{ bgcolor: "background.default" }}
					>
						{theme.palette.mode === "dark" ? (
							<LightModeIcon />
						) : (
							<DarkModeIcon />
						)}
					</IconButton>
				</Box>
			</Paper>

			{}
			{deferredPrompt && (
				<Paper
					elevation={0}
					sx={{
						p: 3,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: 2,
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Box>
							<Typography
								variant="h6"
								sx={{ fontSize: "1rem", fontWeight: 600 }}
							>
								Install App
							</Typography>
							<Typography variant="body2" sx={{ color: "text.secondary" }}>
								Install Focus Feeds for a better experience
							</Typography>
						</Box>
						<Button
							variant="contained"
							startIcon={<DownloadIcon />}
							onClick={onInstall}
						>
							Install
						</Button>
					</Box>
				</Paper>
			)}

			{}
			<Paper
				elevation={0}
				sx={{
					p: 3,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 2,
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					<div>
						<Box
							component="h2"
							sx={{ m: 0, fontSize: "1rem", fontWeight: 600 }}
						>
							Feed Data ({itemsCount} items)
						</Box>
						{lastRefresh && !loading && (
							<Box
								component="span"
								sx={{
									fontSize: "0.85rem",
									color: "text.secondary",
									display: "block",
									mt: 0.5,
								}}
							>
								Updated {formatRefreshTime()}
							</Box>
						)}
					</div>

					<Button
						variant="outlined"
						size="small"
						startIcon={
							loading ? (
								<CircularProgress size={16} color="inherit" />
							) : (
								<RefreshIcon />
							)
						}
						onClick={onRefresh}
						disabled={loading}
					>
						{loading ? "Refreshing..." : "Refresh"}
					</Button>
				</Box>

				<Button
					fullWidth
					variant="outlined"
					color="error"
					onClick={onClearCache}
				>
					Clear Cache & Force Refresh
				</Button>
			</Paper>
		</Box>
	);
}
