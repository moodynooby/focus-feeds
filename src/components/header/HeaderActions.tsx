"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { FilterX, RefreshCw, Settings } from "lucide-react";
import { useModeContext } from "@/lib/theme";
import ColorModeToggle from "./ColorModeToggle";
import ModeMenu from "./ModeMenu";

interface HeaderActionsProps {
	onRefresh: () => void;
	onOpenSettings: () => void;
	onClearFilters?: () => void;
	loading?: boolean;
}

export default function HeaderActions({
	onRefresh,
	onOpenSettings,
	onClearFilters,
	loading = false,
}: HeaderActionsProps) {
	const { mode } = useModeContext();
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
			{mode !== "twitter" && <ModeMenu />}
			<ColorModeToggle />
			{onClearFilters && (
				<Tooltip title="Clear all filters">
					<IconButton
						onClick={onClearFilters}
						size="small"
						sx={{ color: "text.secondary" }}
					>
						<FilterX size={20} />
					</IconButton>
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
						<RefreshCw size={20} />
					</IconButton>
				</span>
			</Tooltip>
			<Tooltip title="Settings">
				<IconButton
					onClick={onOpenSettings}
					size="small"
					sx={{ color: "text.secondary" }}
				>
					<Settings size={20} />
				</IconButton>
			</Tooltip>
		</Box>
	);
}
