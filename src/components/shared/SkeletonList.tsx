"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import { useId } from "react";

interface SkeletonListProps {
	rows?: number;
	variant?: "card" | "row";
}

export default function SkeletonList({
	rows = 5,
	variant = "card",
}: SkeletonListProps) {
	const id = useId();

	if (variant === "row") {
		return (
			<>
				{Array.from({ length: rows }, (_, i) => (
					<Box
						key={`${id}-row-${
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
				))}
			</>
		);
	}

	return (
		<Box
			sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
			suppressHydrationWarning
		>
			{Array.from({ length: rows }, (_, i) => (
				<Paper
					key={`${id}-card-${
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
							<Skeleton
								variant="text"
								width="40%"
								height={16}
								sx={{ mt: 0.5 }}
							/>
							<Skeleton variant="text" width="90%" height={60} sx={{ mt: 1 }} />
						</Box>
					</Box>
				</Paper>
			))}
		</Box>
	);
}
