"use client";

import { useContext } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DownloadIcon from "@mui/icons-material/Download";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../theme";

export default function Settings({
    deferredPrompt,
    onInstall,
    loading,
    itemsCount,
    lastRefresh,
    onRefresh,
    onClearCache,
}) {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    // Format last refresh time
    const formatRefreshTime = () => {
        if (!lastRefresh) return "";
        const now = Date.now();
        const diff = now - lastRefresh.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return "just now";
        if (minutes === 1) return "1 minute ago";
        if (minutes < 60) return `${minutes} minutes ago`;
        return lastRefresh.toLocaleTimeString();
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Theme Settings */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box>
                        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                            Appearance
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Switch between dark and light mode
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={colorMode.toggleColorMode}
                        sx={{ bgcolor: "background.default" }}
                    >
                        {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </Box>
            </Paper>

            {/* PWA Settings */}
            {deferredPrompt && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Box>
                            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
                                Install App
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Install Focus Feeds for a better experience
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={onInstall}
                        >
                            Install
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Cache Settings */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <div>
                        <Box component="h2" sx={{ m: 0, fontSize: "1rem", fontWeight: 600 }}>
                            Feed Data ({itemsCount} items)
                        </Box>
                        {lastRefresh && !loading && (
                            <Box
                                component="span"
                                sx={{
                                    fontSize: "0.85rem",
                                    color: "text.secondary",
                                    display: "block",
                                    mt: 0.5,
                                }}
                            >
                                Updated {formatRefreshTime()}
                            </Box>
                        )}
                    </div>

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                            loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />
                        }
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </Button>
                </Box>

                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={onClearCache}
                >
                    Clear Cache & Force Refresh
                </Button>
            </Paper>
        </Box>
    );
}
