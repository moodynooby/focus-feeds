"use client";

import WifiOffIcon from "@mui/icons-material/WifiOff";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";

interface OfflineBannerProps {
	variant?: "inline" | "fixed";
	sx?: SxProps<Theme>;
}

export default function OfflineBanner({
	variant = "inline",
	sx,
}: OfflineBannerProps) {
	const theme = useTheme();

	return (
		<Alert
			severity="warning"
			icon={<WifiOffIcon />}
			sx={{
				borderRadius: 0,
				m: 0,
				width: "100%",
				backgroundColor: theme.palette.mode === "dark" ? "#5a3d00" : "#fff3e0",
				...(variant === "fixed" && {
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 2000,
				}),
				...sx,
			}}
		>
			<AlertTitle>Offline Mode</AlertTitle>
			{variant === "fixed"
				? "You are offline. Showing cached content."
				: "You are currently offline. Showing cached content and some features may be limited."}
		</Alert>
	);
}
