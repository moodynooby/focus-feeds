"use client";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { useContext } from "react";
import { ColorModeContext } from "@/lib/theme";

export default function ColorModeToggle() {
	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);

	return (
		<Tooltip title={theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"}>
			<IconButton color="inherit" onClick={() => colorMode.toggleColorMode()}>
				{theme.palette.mode === "dark" ? (
					<LightModeOutlinedIcon fontSize="small" />
				) : (
					<DarkModeOutlinedIcon fontSize="small" />
				)}
			</IconButton>
		</Tooltip>
	);
}
