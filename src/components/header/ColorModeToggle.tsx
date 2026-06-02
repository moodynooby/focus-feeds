"use client";

import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { Moon, Sun } from "lucide-react";
import { useContext } from "react";
import { ColorModeContext } from "@/lib/theme";

export default function ColorModeToggle() {
	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);

	return (
		<Tooltip title={theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"}>
			<IconButton color="inherit" onClick={() => colorMode.toggleColorMode()}>
				{theme.palette.mode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
			</IconButton>
		</Tooltip>
	);
}
