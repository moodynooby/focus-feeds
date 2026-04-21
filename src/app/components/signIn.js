"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export default function SignIn() {
	const [passphrase, setPassphrase] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passphrase }),
			});

			const result = await response.json();

			if (!result.success) {
				setError(result.error || "Failed to sign in");
			} else {
				window.location.reload();
			}
		} catch (_err) {
			setError("An error occurred during sign in");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box sx={{ width: "100%", maxWidth: 400 }}>
			<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
				Enter a passphrase to sync your feeds across devices. Use the same
				passphrase on any device to access your feeds.
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{ display: "flex", flexDirection: "column", gap: 2 }}
			>
				<TextField
					label="Passphrase"
					type="password"
					value={passphrase}
					onChange={(e) => setPassphrase(e.target.value)}
					required
					fullWidth
					autoComplete="current-password"
					helperText="Min 4 characters. New passphrase creates a new account."
				/>
				<Button
					type="submit"
					variant="contained"
					disabled={loading}
					startIcon={loading && <CircularProgress size={16} color="inherit" />}
				>
					{loading ? "Syncing..." : "Sync Feeds"}
				</Button>
			</Box>
		</Box>
	);
}
