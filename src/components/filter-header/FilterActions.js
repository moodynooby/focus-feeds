"use client";

import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export default function FilterActions({
	onRefresh,
	onOpenSettings,
	onClearFilters,
	hasActiveFilters,
	showClearButton = false,
	loading = false,
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
			{showClearButton && hasActiveFilters && (
				<Tooltip title="Clear all filters">
					<Button
						size="small"
						startIcon={<FilterListOffIcon />}
						onClick={onClearFilters}
						sx={{ mr: 1, textTransform: "none" }}
					>
						Clear
					</Button>
				</Tooltip>
			)}
			<Tooltip title={loading ? "Loading..." : "Refresh feeds"}>
				<span>
					<IconButton
						onClick={onRefresh}
						size="small"
						disabled={loading}
						sx={{
							color: "text.secondary",
							animation: loading ? "spin 1s linear infinite" : "none",
							"@keyframes spin": {
								from: { transform: "rotate(0deg)" },
								to: { transform: "rotate(360deg)" },
							},
						}}
					>
						<RefreshIcon fontSize="small" />
					</IconButton>
				</span>
			</Tooltip>
			<Tooltip title="Settings">
				<IconButton
					onClick={onOpenSettings}
					size="small"
					sx={{ color: "text.secondary" }}
				>
					<SettingsIcon fontSize="small" />
				</IconButton>
			</Tooltip>
		</Box>
	);
}
