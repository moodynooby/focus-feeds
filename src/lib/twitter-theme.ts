import { createTheme, type ThemeOptions } from "@mui/material/styles";

const getTwitterDesignTokens = (_mode: "light" | "dark"): ThemeOptions => ({
	palette: {
		mode: "dark", // Twitter/X is always dark mode
		primary: {
			main: "#1d9bf0",
			light: "#1d9bf026",
			dark: "#1976d2",
			contrastText: "#ffffff",
		},
		background: {
			default: "#000000",
			paper: "#16181c",
		},
		text: {
			primary: "#e7e9ea",
			secondary: "#71767b",
		},
		divider: "#2f3336",
		grey: {
			50: "#f9f9f9",
			100: "#f0f0f0",
			200: "#e0e0e0",
			300: "#c4c4c4",
			400: "#a3a3a3",
			500: "#828282",
			600: "#616161",
			700: "#424242",
			800: "#212121",
			900: "#000000",
		},
	},
	shape: {
		borderRadius: 8,
	},
	typography: {
		fontFamily:
			"Inter, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		button: {
			textTransform: "none",
			fontWeight: 700,
		},
		body2: {
			fontSize: "0.875rem",
		},
		caption: {
			fontSize: "0.75rem",
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 999,
					fontWeight: 700,
					textTransform: "none",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
					border: "1px solid #2f3336",
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: 999,
					"&:hover": {
						backgroundColor: "rgba(29, 155, 240, 0.1)",
					},
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
			},
		},
	},
});

export const twitterTheme = (mode: "light" | "dark") =>
	createTheme(getTwitterDesignTokens(mode));
