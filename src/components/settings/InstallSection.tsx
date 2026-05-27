"use client";

import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

interface InstallSectionProps {
	deferredPrompt: Event | null;
	onInstall: () => void;
	installStatus: string;
}

export default function InstallSection({
	deferredPrompt,
	onInstall,
	installStatus,
}: InstallSectionProps) {
	if (!deferredPrompt && installStatus === "installed") {
		return null;
	}

	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
				Install App
			</Typography>
			{installStatus === "installed" ? (
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Focus Feeds is installed on your device.
				</Typography>
			) : (
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Install Focus Feeds on your device for quick access.
				</Typography>
			)}
			{deferredPrompt && (
				<Button
					variant="contained"
					fullWidth
					onClick={onInstall}
					startIcon={<DownloadIcon />}
				>
					Install
				</Button>
			)}
			{!deferredPrompt && installStatus === "dismissed" && (
				<Typography variant="caption" color="text.secondary">
					You dismissed the install prompt. Refresh the page to try again.
				</Typography>
			)}
		</Paper>
	);
}
