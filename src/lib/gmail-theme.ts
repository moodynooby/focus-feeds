import { createTheme, type ThemeOptions } from "@mui/material/styles";

const getGmailDesignTokens = (mode: "light" | "dark"): ThemeOptions => ({
	palette: {
		mode,
		primary: {
			main: "#0b57d0",
			light: "#eaf1fb",
			dark: "#0842a0",
			contrastText: "#ffffff",
		},
		background: {
			default: mode === "dark" ? "#1a1c1e" : "#f6f8fc",
			paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
		},
		text: {
			primary: mode === "dark" ? "#e3e2e6" : "#1f1f1f",
			secondary: mode === "dark" ? "#c4c6d0" : "#444746",
		},
		divider: mode === "dark" ? "#444746" : "#e0e2e0",
	},
	shape: {
		borderRadius: 12,
	},
	typography: {
		fontFamily: "Inter, Roboto, Arial, sans-serif",
		button: {
			textTransform: "none",
			fontWeight: 500,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 24,
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: 24,
					margin: "0 8px",
					"&.Mui-selected": {
						backgroundColor: mode === "dark" ? "#004a77" : "#c2e7ff",
						color: mode === "dark" ? "#c2e7ff" : "#001d35",
						"&:hover": {
							backgroundColor: mode === "dark" ? "#004a77" : "#c2e7ff",
						},
						"& .MuiListItemIcon-root": {
							color: mode === "dark" ? "#c2e7ff" : "#001d35",
						},
					},
				},
			},
		},
	},
});

export const gmailTheme = (mode: "light" | "dark") =>
	createTheme(getGmailDesignTokens(mode));
