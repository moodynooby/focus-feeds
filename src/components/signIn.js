"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useActionState } from "react";
import { createOrGetUser } from "@/app/actions";

async function signInAction(_prevState, formData) {
	const passphrase = formData.get("passphrase");
	const result = await createOrGetUser(passphrase);

	if (!result.success) {
		return { error: result.error || "Failed to sign in" };
	}

	window.location.reload();
	return {};
}

export default function SignIn() {
	const [state, formAction, pending] = useActionState(signInAction, {});

	return (
		<Box sx={{ width: "100%", maxWidth: 400 }}>
			<Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
				Enter a passphrase to sync your feeds across devices. Use the same
				passphrase on any device to access your feeds.
			</Typography>

			{state?.error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{state.error}
				</Alert>
			)}

			<Box
				component="form"
				action={formAction}
				sx={{ display: "flex", flexDirection: "column", gap: 2 }}
			>
				<TextField
					label="Passphrase"
					type="password"
					name="passphrase"
					required
					fullWidth
					autoComplete="current-password"
					helperText="Min 4 characters. New passphrase creates a new account."
				/>
				<Button
					type="submit"
					variant="contained"
					disabled={pending}
					startIcon={pending && <CircularProgress size={16} color="inherit" />}
				>
					{pending ? "Syncing..." : "Sync Feeds"}
				</Button>
			</Box>
		</Box>
	);
}
