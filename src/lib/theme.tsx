"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, type Theme, ThemeProvider } from "@mui/material/styles";
import { Inter } from "next/font/google";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
import { useLocalStorage } from "usehooks-ts";
import type { AppMode } from "@/types";

const inter = Inter({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
});

type Mode = "light" | "dark";

interface ColorModeContextValue {
	toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue>({
	toggleColorMode: () => {},
});

interface ModeContextValue {
	mode: AppMode;
	setMode: (mode: AppMode) => void;
}

export const ModeContext = createContext<ModeContextValue>({
	mode: "classic",
	setMode: () => {},
});

export const useModeContext = () => useContext(ModeContext);
export const useColorModeContext = () => useContext(ColorModeContext);

export const PODCAST_ACCENT = "#a855f7";
export const PODCAST_ACCENT_RGB = "168, 85, 247";

const baseTheme = {
	typography: {
		fontFamily: inter.style.fontFamily,
		button: { textTransform: "none" },
	},
	shape: {
		borderRadius: 12,
	},
	components: {
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
			},
		},
	},
};

const getDesignTokens = (mode: Mode) => ({
	palette: {
		mode,
		...(mode === "dark"
			? {
					primary: {
						main: "#f8fafc",
						light: "#cbd5e1",
						dark: "#94a3b8",
						contrastText: "#09090b",
					},
					secondary: {
						main: "#a1a1aa",
						light: "#d4d4d8",
						dark: "#52525b",
						contrastText: "#09090b",
					},
					background: {
						default: "#09090b",
						paper: "#18181b",
					},
					text: {
						primary: "#f8fafc",
						secondary: "#a1a1aa",
					},
					divider: "rgba(255, 255, 255, 0.08)",
					action: {
						hover: "rgba(255, 255, 255, 0.04)",
						selected: "rgba(255, 255, 255, 0.08)",
					},
				}
			: {
					primary: {
						main: "#18181b",
						light: "#27272a",
						dark: "#000000",
						contrastText: "#ffffff",
					},
					secondary: {
						main: "#71717a",
						light: "#a1a1aa",
						dark: "#52525b",
						contrastText: "#ffffff",
					},
					background: {
						default: "#ffffff",
						paper: "#f8fafc",
					},
					text: {
						primary: "#09090b",
						secondary: "#52525b",
					},
					divider: "rgba(0, 0, 0, 0.08)",
					action: {
						hover: "rgba(0, 0, 0, 0.04)",
						selected: "rgba(0, 0, 0, 0.08)",
					},
				}),
	},
	shape: {
		borderRadius: 16,
	},
	typography: {
		h1: { fontWeight: 700, letterSpacing: "-0.025em" },
		h2: { fontWeight: 600, letterSpacing: "-0.025em" },
		h3: { fontWeight: 600, letterSpacing: "-0.025em" },
		button: { fontWeight: 600 },
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: "12px",
					boxShadow: "none",
					padding: "8px 16px",
					"&:hover": {
						boxShadow: "none",
					},
				},
				containedPrimary: ({ theme }: { theme: Theme }) => ({
					backgroundColor: theme.palette.primary.main,
					color: theme.palette.primary.contrastText,
					"&:hover": {
						backgroundColor:
							theme.palette.mode === "dark"
								? theme.palette.primary.light
								: theme.palette.primary.light,
					},
				}),
			},
		},
		MuiTab: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					textTransform: "none",
					fontWeight: 500,
					fontSize: "0.95rem",
					minHeight: "48px",
					color: theme.palette.text.secondary,
					"&.Mui-selected": {
						color: theme.palette.text.primary,
					},
				}),
			},
		},
		MuiCard: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					backgroundColor: theme.palette.background.paper,
					border: `1px solid ${theme.palette.divider}`,
					backgroundImage: "none",
				}),
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					backgroundImage: "none",
					...(theme.palette.mode === "dark"
						? {
								boxShadow: "none",
								border: `1px solid ${theme.palette.divider}`,
							}
						: {
								border: `1px solid ${theme.palette.divider}`,
							}),
				}),
			},
		},
		MuiCssBaseline: {
			styleOverrides: (theme: Theme) => ({
				body: {
					scrollbarColor: `${theme.palette.divider} ${theme.palette.background.default}`,
					"&::-webkit-scrollbar, & *::-webkit-scrollbar": {
						backgroundColor: theme.palette.background.default,
						width: "8px",
						height: "8px",
					},
					"&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
						borderRadius: 8,
						backgroundColor: theme.palette.divider,
						minHeight: 24,
						border: `2px solid ${theme.palette.background.default}`,
					},
					"&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus":
						{
							backgroundColor: theme.palette.text.secondary,
						},
					"&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active":
						{
							backgroundColor: theme.palette.text.secondary,
						},
					"&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
						{
							backgroundColor: theme.palette.text.secondary,
						},
				},
			}),
		},
	},
});

const getGmailDesignTokens = (mode: Mode) => ({
	palette: {
		mode,
		primary: {
			main: "#0b57d0",
			light: mode === "dark" ? "#004a77" : "#c2e7ff",
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
		divider: mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "#e0e2e0",
		action: {
			hover:
				mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
		},
	},
	shape: {
		borderRadius: 12,
	},
	typography: {
		button: { fontWeight: 500 },
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 24,
					textTransform: "none",
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					borderRadius: 24,
					margin: "0 8px",
					"&.Mui-selected": {
						backgroundColor: theme.palette.primary.light,
						color:
							theme.palette.mode === "dark"
								? theme.palette.primary.contrastText
								: "#001d35",
						"&:hover": {
							backgroundColor: theme.palette.primary.light,
						},
						"& .MuiListItemIcon-root": {
							color: "inherit",
						},
					},
				}),
			},
		},
	},
});

const getTwitterDesignTokens = (mode: Mode) => ({
	palette: {
		mode,
		primary: {
			main: "#1d9bf0",
			light: "rgba(29, 155, 240, 0.1)",
			dark: "#1976d2",
			contrastText: "#ffffff",
		},
		background: {
			default: mode === "dark" ? "#000000" : "#ffffff",
			paper: mode === "dark" ? "#16181c" : "#f7f9f9",
		},
		text: {
			primary: mode === "dark" ? "#e7e9ea" : "#0f1419",
			secondary: mode === "dark" ? "#71767b" : "#536471",
		},
		divider: mode === "dark" ? "#2f3336" : "#eff3f4",
		action: {
			hover: "rgba(29, 155, 240, 0.1)",
		},
	},
	shape: {
		borderRadius: 8,
	},
	typography: {
		button: { fontWeight: 700 },
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
				root: ({ theme }: { theme: Theme }) => ({
					border: `1px solid ${theme.palette.divider}`,
					backgroundImage: "none",
				}),
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: 999,
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

export default function ThemeRegistry({ children }: { children: ReactNode }) {
	const [colorMode, setColorMode] = useState<Mode>("dark");
	const [appMode, setAppMode] = useLocalStorage<AppMode>(
		"focusFeedsMode",
		"classic",
	);
	const [_isPending, startTransition] = useTransition();

	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedMode = localStorage.getItem("themeMode") as Mode | null;
			if (savedMode) {
				setColorMode(savedMode);
			}
		}
	}, []);

	const colorModeContext: ColorModeContextValue = {
		toggleColorMode: () => {
			setColorMode((prev) => {
				const next = prev === "light" ? "dark" : "light";
				localStorage.setItem("themeMode", next);
				return next;
			});
		},
	};

	const setModeWithTransition = (nextMode: AppMode) => {
		if (nextMode === appMode) return;
		startTransition(() => {
			setAppMode(nextMode);
		});
	};

	const theme = useMemo(() => {
		let modeTokens: Parameters<typeof createTheme>[0];
		switch (appMode) {
			case "gmail":
				modeTokens = getGmailDesignTokens(colorMode);
				break;
			case "twitter":
				modeTokens = getTwitterDesignTokens(colorMode);
				break;
			default:
				modeTokens = getDesignTokens(colorMode);
		}
		return createTheme(baseTheme, modeTokens);
	}, [appMode, colorMode]);

	return (
		<ModeContext.Provider
			value={{ mode: appMode, setMode: setModeWithTransition }}
		>
			<ColorModeContext.Provider value={colorModeContext}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					{children}
				</ThemeProvider>
			</ColorModeContext.Provider>
		</ModeContext.Provider>
	);
}
