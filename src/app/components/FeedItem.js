"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

export default function FeedItem({ item }) {
  // Safety check for hostname to prevent crashes
  let hostname = "";
  try {
    hostname = new URL(item.link).hostname;
  } catch (e) {
    // Fallback if link is invalid
    hostname = "example.com";
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <Avatar
          variant="rounded"
          src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
          sx={{ width: 20, height: 20, bgcolor: "transparent" }}
        />
        <Box
          component="span"
          sx={{
            fontWeight: 500,
            fontSize: "0.85rem",
            color: "text.secondary",
          }}
        >
          {item.source}
        </Box>
        <Box
          sx={{
            ml: "auto",
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          {new Date(item.pubDate).toLocaleDateString()}
        </Box>
      </Box>
      <Box component="h3" sx={{ m: 0 }}>
        <Box
          component="a"
          href={item.link}
          target="_blank"
          rel="noreferrer"
          sx={{
            textDecoration: "none",
            color: "text.primary",
            fontSize: "1.1rem",
            fontWeight: 600,
            lineHeight: 1.4,
            "&:hover": { color: "primary.main" },
          }}
        >
          {item.title}
        </Box>
      </Box>
    </Paper>
  );
}
