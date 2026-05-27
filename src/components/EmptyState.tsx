"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface EmptyStateProps {
	message: string;
	actionLabel?: string;
	onAction?: () => void;
}

export default function EmptyState({
	message,
	actionLabel,
	onAction,
}: EmptyStateProps) {
	return (
		<Box sx={{ p: 4, textAlign: "center" }}>
			<Typography variant="body1" color="text.secondary" gutterBottom>
				{message}
			</Typography>
			{actionLabel && onAction && (
				<Button variant="outlined" size="small" onClick={onAction}>
					{actionLabel}
				</Button>
			)}
		</Box>
	);
}
