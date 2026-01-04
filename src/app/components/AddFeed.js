"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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
        <Box>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "flex", gap: 1, mb: 3 }}
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

            {/* Feed list */}
            <Box sx={{ width: "98%" }}>
                {urls.map((url) => (
                    <Box
                        key={url}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1,
                            borderBottom: "1px solid #eee",
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
                ))}
                {urls.length === 0 && (
                    <Box sx={{ textAlign: "center", fontStyle: "italic", opacity: 0.6, mt: 2 }}>
                        No feeds added yet. Add one above!
                    </Box>
                )}
            </Box>

            {/* Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCancelDelete}
            >
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
