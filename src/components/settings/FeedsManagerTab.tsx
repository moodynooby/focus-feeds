"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useState } from "react";

interface FeedsManagerTabProps {
	urls: string[];
	onAdd: (url: string) => void;
	onRemove: (url: string) => void;
}

export default function FeedsManagerTab({
	urls,
	onAdd,
	onRemove,
}: FeedsManagerTabProps) {
	const [newUrl, setNewUrl] = useState("");

	const handleAdd = () => {
		if (newUrl.trim()) {
			onAdd(newUrl.trim());
			setNewUrl("");
		}
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Paper
				variant="outlined"
				sx={{
					p: 2,
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<AddCircleIcon color="primary" fontSize="small" />
					<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
						Add Feed
					</Typography>
				</Box>
				<Box sx={{ display: "flex", gap: 1 }}>
					<Input
						placeholder="https://example.com/feed.xml"
						value={newUrl}
						onChange={(e) => setNewUrl(e.target.value)}
						onKeyDown={(e: React.KeyboardEvent) =>
							e.key === "Enter" && handleAdd()
						}
						sx={{ flex: 1 }}
						startAdornment={
							<LinkIcon sx={{ mr: 1, color: "text.secondary", fontSize: 18 }} />
						}
					/>
					<Button variant="contained" onClick={handleAdd} size="small">
						Add
					</Button>
				</Box>
			</Paper>

			<Box>
				<Typography
					variant="subtitle2"
					sx={{
						fontWeight: 600,
						mb: 2,
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<Box
						sx={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							bgcolor: "primary.main",
						}}
					/>
					Your Feeds ({urls.length})
				</Typography>

				{urls.length === 0 ? (
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ textAlign: "center", py: 4 }}
					>
						No feeds added yet. Add a feed URL above.
					</Typography>
				) : (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
						{urls.map((url) => (
							<Paper
								key={url}
								variant="outlined"
								sx={{
									p: 1.5,
									display: "flex",
									alignItems: "center",
									gap: 1,
								}}
							>
								<LinkIcon sx={{ color: "text.secondary", fontSize: 16 }} />
								<Typography
									variant="body2"
									sx={{
										flex: 1,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{url}
								</Typography>
								<IconButton
									size="small"
									onClick={() => onRemove(url)}
									sx={{ color: "error.main" }}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</Paper>
						))}
					</Box>
				)}
			</Box>
		</Box>
	);
}
