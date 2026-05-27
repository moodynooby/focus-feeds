"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import type { SyncInfo } from "@/types";

interface SyncStatusDisplayProps {
	syncStatus: {
		loading: boolean;
		error: string | null;
		lastSync: number | null;
		info: SyncInfo | null;
	};
}

export default function SyncStatusDisplay({
	syncStatus,
}: SyncStatusDisplayProps) {
	if (syncStatus.loading) {
		return (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<CircularProgress size={16} />
				<Typography variant="caption">Syncing...</Typography>
			</Box>
		);
	}

	if (syncStatus.error) {
		return (
			<Typography variant="caption" color="error">
				Sync error: {syncStatus.error}
			</Typography>
		);
	}

	if (syncStatus.info) {
		return (
			<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
				<Typography variant="caption" color="text.secondary">
					Synced via {syncStatus.info.strategy} strategy
				</Typography>
				{syncStatus.info.addedToDb.length > 0 && (
					<Typography variant="caption" color="success.main">
						+{syncStatus.info.addedToDb.length} feeds added
					</Typography>
				)}
				{syncStatus.info.pulledFromDb.length > 0 && (
					<Typography variant="caption" color="info.main">
						+{syncStatus.info.pulledFromDb.length} feeds pulled
					</Typography>
				)}
			</Box>
		);
	}

	return null;
}
