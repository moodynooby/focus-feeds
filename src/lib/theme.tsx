"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Inter } from "next/font/google";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
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
						light: "#ffffff",
						dark: "#cbd5e1",
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
						backgroundColor:
							mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.04)",
					},
				},
				containedPrimary: {
					backgroundColor: mode === "dark" ? "#f8fafc" : "#18181b",
					color: mode === "dark" ? "#09090b" : "#ffffff",
					"&:hover": {
						backgroundColor: mode === "dark" ? "#e2e8f0" : "#27272a",
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
					color: mode === "dark" ? "#a1a1aa" : "#71717a",
					"&.Mui-selected": {
						color: mode === "dark" ? "#f8fafc" : "#18181b",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					backgroundColor: mode === "dark" ? "#18181b" : "#ffffff",
					border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: {
				body: {
					scrollbarColor:
						mode === "dark" ? "#27272a #09090b" : "#e4e4e7 #ffffff",
					"&::-webkit-scrollbar, & *::-webkit-scrollbar": {
						backgroundColor: mode === "dark" ? "#09090b" : "#ffffff",
						width: "8px",
						height: "8px",
					},
					"&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
						borderRadius: 8,
						backgroundColor: mode === "dark" ? "#27272a" : "#e4e4e7",
						minHeight: 24,
						border: `2px solid ${mode === "dark" ? "#09090b" : "#ffffff"}`,
					},
					"&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus":
						{
							backgroundColor: mode === "dark" ? "#3f3f46" : "#d4d4d8",
						},
					"&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active":
						{
							backgroundColor: mode === "dark" ? "#3f3f46" : "#d4d4d8",
						},
					"&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
						{
							backgroundColor: mode === "dark" ? "#3f3f46" : "#d4d4d8",
						},
				},
			},
		},
	},
});

const getGmailDesignTokens = (mode: Mode) => ({
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
		button: { fontWeight: 500 },
	},
	components: {
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

const getTwitterDesignTokens = (mode: Mode) => ({
	palette: {
		mode,
		primary: {
			main: "#1d9bf0",
			light: "#1d9bf026",
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
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					border: `1px solid ${mode === "dark" ? "#2f3336" : "#eff3f4"}`,
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

export default function ThemeRegistry({ children }: { children: ReactNode }) {
	const [colorMode, setColorMode] = useState<Mode>("dark");
	const [appMode, setAppMode] = useLocalStorage<AppMode>(
		"focusFeedsMode",
		"classic",
	);

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
		<ModeContext.Provider value={{ mode: appMode, setMode: setAppMode }}>
			<ColorModeContext.Provider value={colorModeContext}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					{children}
				</ThemeProvider>
			</ColorModeContext.Provider>
		</ModeContext.Provider>
	);
}
