import type { PaletteMode, ThemeOptions } from "@mui/material/styles";

export interface DesignTokens {
	palette: ThemeOptions["palette"];
	typography: ThemeOptions["typography"];
	shape: ThemeOptions["shape"];
	components: ThemeOptions["components"];
}

const sharedComponents: ThemeOptions["components"] = {
	MuiPaper: {
		styleOverrides: {
			root: {
				backgroundImage: "none",
			},
		},
	},
	MuiCssBaseline: {
		styleOverrides: {
			body: {
				"&::-webkit-scrollbar, & *::-webkit-scrollbar": {
					width: "8px",
					height: "8px",
				},
				"&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
					borderRadius: 8,
					minHeight: 24,
					border: `2px solid transparent`,
				},
			},
		},
	},
};

const baseTypography: ThemeOptions["typography"] = {
	button: { textTransform: "none", fontWeight: 600 },
};

const baseShape: ThemeOptions["shape"] = {
	borderRadius: 16,
};

export const createDefaultDesignTokens = (mode: PaletteMode): DesignTokens => {
	const isDark = mode === "dark";

	return {
		palette: {
			mode,
			primary: {
				main: isDark ? "#f8fafc" : "#18181b",
				light: isDark ? "#ffffff" : "#27272a",
				dark: isDark ? "#cbd5e1" : "#000000",
				contrastText: isDark ? "#09090b" : "#ffffff",
			},
			secondary: {
				main: "#71717a",
				light: "#a1a1aa",
				dark: "#52525b",
				contrastText: "#ffffff",
			},
			background: {
				default: isDark ? "#09090b" : "#ffffff",
				paper: isDark ? "#18181b" : "#f8fafc",
			},
			text: {
				primary: isDark ? "#f8fafc" : "#09090b",
				secondary: isDark ? "#a1a1aa" : "#52525b",
			},
			divider: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
		},
		typography: {
			...baseTypography,
			h1: { fontWeight: 700, letterSpacing: "-0.025em" },
			h2: { fontWeight: 600, letterSpacing: "-0.025em" },
			h3: { fontWeight: 600, letterSpacing: "-0.025em" },
		},
		shape: baseShape,
		components: {
			...sharedComponents,
			MuiButton: {
				styleOverrides: {
					root: {
						borderRadius: "12px",
						boxShadow: "none",
						padding: "8px 16px",
						"&:hover": {
							boxShadow: "none",
							backgroundColor: isDark
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.04)",
						},
					},
				},
			},
			MuiTab: {
				styleOverrides: {
					root: {
						textTransform: "none",
						fontWeight: 500,
						fontSize: "0.95rem",
						minHeight: "48px",
						color: isDark ? "#a1a1aa" : "#71717a",
						"&.Mui-selected": {
							color: isDark ? "#f8fafc" : "#18181b",
						},
					},
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						backgroundImage: "none",
						backgroundColor: isDark ? "#18181b" : "#ffffff",
						border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
					},
				},
			},
			MuiCssBaseline: {
				styleOverrides: {
					body: {
						scrollbarColor: isDark ? "#27272a #09090b" : "#e4e4e7 #ffffff",
						"&::-webkit-scrollbar, & *::-webkit-scrollbar": {
							backgroundColor: isDark ? "#09090b" : "#ffffff",
							width: "8px",
							height: "8px",
						},
						"&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
							borderRadius: 8,
							backgroundColor: isDark ? "#27272a" : "#e4e4e7",
							minHeight: 24,
							border: `2px solid ${isDark ? "#09090b" : "#ffffff"}`,
						},
						"&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
							backgroundColor: isDark ? "#3f3f46" : "#d4d4d8",
						},
						"&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
							backgroundColor: isDark ? "#3f3f46" : "#d4d4d8",
						},
						"&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
							backgroundColor: isDark ? "#3f3f46" : "#d4d4d8",
						},
					},
				},
			},
		},
	};
};

export const createGmailDesignTokens = (mode: PaletteMode): DesignTokens => {
	const isDark = mode === "dark";

	return {
		palette: {
			mode,
			primary: {
				main: "#0b57d0",
				light: "#eaf1fb",
				dark: "#0842a0",
				contrastText: "#ffffff",
			},
			background: {
				default: isDark ? "#1a1c1e" : "#f6f8fc",
				paper: isDark ? "#1e1e1e" : "#ffffff",
			},
			text: {
				primary: isDark ? "#e3e2e6" : "#1f1f1f",
				secondary: isDark ? "#c4c6d0" : "#444746",
			},
			divider: isDark ? "#444746" : "#e0e2e0",
		},
		typography: {
			...baseTypography,
			fontFamily: "Inter, Roboto, Arial, sans-serif",
		},
		shape: {
			borderRadius: 12,
		},
		components: {
			...sharedComponents,
			MuiButton: {
				styleOverrides: {
					root: {
						borderRadius: 24,
					},
				},
			},
			MuiListItemButton: {
				styleOverrides: {
					root: {
						borderRadius: 24,
						margin: "0 8px",
						"&.Mui-selected": {
							backgroundColor: isDark ? "#004a77" : "#c2e7ff",
							color: isDark ? "#c2e7ff" : "#001d35",
							"&:hover": {
								backgroundColor: isDark ? "#004a77" : "#c2e7ff",
							},
							"& .MuiListItemIcon-root": {
								color: isDark ? "#c2e7ff" : "#001d35",
							},
						},
					},
				},
			},
		},
	};
};
