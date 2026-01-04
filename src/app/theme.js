"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Inter } from "next/font/google";
import { createContext, useState, useEffect, useMemo, useContext } from "react";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const ColorModeContext = createContext({ toggleColorMode: () => { } });

// Theme Design System
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "dark"
      ? {
        // Dark Mode Palette
        primary: {
          main: "#f8fafc", // Zinc 50
          light: "#ffffff",
          dark: "#cbd5e1",
          contrastText: "#09090b",
        },
        secondary: {
          main: "#a1a1aa", // Zinc 400
          light: "#d4d4d8",
          dark: "#52525b",
          contrastText: "#09090b",
        },
        background: {
          default: "#09090b", // Zinc 950
          paper: "#18181b", // Zinc 900
        },
        text: {
          primary: "#f8fafc",
          secondary: "#a1a1aa",
        },
        divider: "rgba(255, 255, 255, 0.08)",
      }
      : {
        // Light Mode Palette
        primary: {
          main: "#18181b", // Zinc 900
          light: "#27272a",
          dark: "#000000",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#71717a", // Zinc 500
          light: "#a1a1aa",
          dark: "#52525b",
          contrastText: "#ffffff",
        },
        background: {
          default: "#ffffff",
          paper: "#f8fafc", // Zinc 50
        },
        text: {
          primary: "#09090b", // Zinc 950
          secondary: "#52525b", // Zinc 600
        },
        divider: "rgba(0, 0, 0, 0.08)",
      }),
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: { fontWeight: 700, letterSpacing: "-0.025em" },
    h2: { fontWeight: 600, letterSpacing: "-0.025em" },
    h3: { fontWeight: 600, letterSpacing: "-0.025em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
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
          backgroundImage: "none",
          backgroundColor: mode === "dark" ? "#18181b" : "#ffffff",
          border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
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

export default function ThemeRegistry({ children }) {
  // Determine if we should check system preference.
  // Default to 'dark'.
  const [mode, setMode] = useState("dark");

  // Load preference from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("themeMode");
      if (savedMode) {
        setMode(savedMode);
      }
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("themeMode", newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
