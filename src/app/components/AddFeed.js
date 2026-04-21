"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export default function AddFeed({ urls, onAdd, onRemove }) {
	const [newUrl, setNewUrl] = useState("");
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [urlToDelete, setUrlToDelete] = useState(null);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (newUrl) {
			onAdd(newUrl);
			setNewUrl("");
		}
	};

	const handleDeleteClick = (url) => {
		setUrlToDelete(url);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (urlToDelete) {
			onRemove(urlToDelete);
		}
		setDeleteConfirmOpen(false);
		setUrlToDelete(null);
	};

	const handleCancelDelete = () => {
		setDeleteConfirmOpen(false);
		setUrlToDelete(null);
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Paper
				elevation={1}
				sx={{
					p: 3,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<AddCircleIcon color="primary" />
					<Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
						Add New Feed
					</Typography>
				</Box>
				<Box
					component="form"
					onSubmit={handleSubmit}
					sx={{ display: "flex", gap: 1 }}
				>
					<Input
						type="url"
						value={newUrl}
						onChange={(e) => setNewUrl(e.target.value)}
						placeholder="Enter RSS URL..."
						required
						sx={{ flex: 1, p: 1 }}
						autoComplete="off"
					/>
					<Button type="submit" variant="contained">
						Add Feed
					</Button>
				</Box>
			</Paper>

			<Paper
				elevation={1}
				sx={{
					p: 3,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
					<LinkIcon color="primary" />
					<Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
						Your Feeds
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "text.secondary", ml: "auto" }}
					>
						{urls.length} feed{urls.length !== 1 ? "s" : ""}
					</Typography>
				</Box>
				<Box>
					{urls.map((url, index) => (
						<Box key={url}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									py: 1.5,
								}}
							>
								<span style={{ flex: 1, wordBreak: "break-all" }}>{url}</span>
								<Button
									size="small"
									color="error"
									onClick={() => handleDeleteClick(url)}
									sx={{ ml: 1 }}
								>
									Remove
								</Button>
							</Box>
							{index < urls.length - 1 && <Divider />}
						</Box>
					))}
					{urls.length === 0 && (
						<Box
							sx={{
								textAlign: "center",
								fontStyle: "italic",
								opacity: 0.6,
								py: 2,
							}}
						>
							No feeds added yet. Add one above!
						</Box>
					)}
				</Box>
			</Paper>

			<Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
				<DialogTitle>remove Feed?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to remove this feed?
						<br />
						<strong>{urlToDelete}</strong>
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancelDelete}>Cancel</Button>
					<Button onClick={handleConfirmDelete} color="error" autoFocus>
						Remove
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
