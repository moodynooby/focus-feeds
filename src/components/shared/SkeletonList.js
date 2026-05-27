"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";

export default function SkeletonList({ rows = 5, variant = "card" }) {
	if (variant === "row") {
		return [...Array(rows)].map((_, i) => (
			<Box
				key={`skel-row-${
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no stable ids
					i
				}`}
				sx={{
					display: "flex",
					alignItems: "center",
					px: 2,
					height: 40,
					borderBottom: 1,
					borderColor: "divider",
					gap: 2,
				}}
			>
				<Skeleton variant="rounded" width={16} height={16} />
				<Skeleton variant="rounded" width={16} height={16} />
				<Skeleton variant="text" width={120} />
				<Skeleton variant="text" sx={{ flex: 1 }} />
				<Skeleton variant="text" width={60} />
			</Box>
		));
	}

	const cards = [...Array(rows)].map((_, i) => (
		<Paper
			key={`skel-card-${
				// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no stable ids
				i
			}`}
			elevation={0}
			sx={{
				p: 2,
				border: 1,
				borderColor: "divider",
				borderRadius: 2,
			}}
		>
			<Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
				<Skeleton variant="circular" width={40} height={40} />
				<Box sx={{ flex: 1 }}>
					<Skeleton variant="text" width="60%" height={24} />
					<Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
					<Skeleton variant="text" width="90%" height={60} sx={{ mt: 1 }} />
				</Box>
			</Box>
		</Paper>
	));

	return (
		<Box
			sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
			suppressHydrationWarning
		>
			{cards}
		</Box>
	);
}
