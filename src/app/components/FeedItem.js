"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import { getHostname } from "./utils";

export default function FeedItem({ item }) {
	const hostname = getHostname(item.link);

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
				<Image
					src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
					alt={item.source}
					width={20}
					height={20}
					style={{ borderRadius: 4 }}
					unoptimized={false}
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
					{new Date(item.pubDate).toISOString().split("T")[0]}
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
