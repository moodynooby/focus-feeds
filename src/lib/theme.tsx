"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Inter } from "next/font/google";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { createDefaultDesignTokens } from "./design-tokens";

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

export default function ThemeRegistry({ children }: { children: ReactNode }) {
	const [mode, setMode] = useState<Mode>("dark");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedMode = localStorage.getItem("themeMode") as Mode | null;
			if (savedMode) {
				setMode(savedMode);
			}
		}
	}, []);

	const colorMode: ColorModeContextValue = {
		toggleColorMode: () => {
			setMode((prevMode) => {
				const newMode = prevMode === "light" ? "dark" : "light";
				localStorage.setItem("themeMode", newMode);
				return newMode;
			});
		},
	};

	const designTokens = createDefaultDesignTokens(mode);
	const theme = createTheme({
		...designTokens,
		typography: {
			...designTokens.typography,
			fontFamily: inter.style.fontFamily,
		},
	});

	return (
		<ColorModeContext.Provider value={colorMode}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
}
