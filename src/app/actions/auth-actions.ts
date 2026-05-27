"use server";

import {
	clearSession,
	getCurrentUser,
	getOrCreateUser,
	setSession,
} from "@/lib/simple-auth";
import type { AuthResult, CheckAuthResult } from "@/types";

export async function createOrGetUser(passphrase: string): Promise<AuthResult> {
	if (!passphrase || passphrase.trim() === "") {
		return { success: false, error: "Passphrase is required" };
	}

	if (passphrase.length < 4) {
		return {
			success: false,
			error: "Passphrase must be at least 4 characters",
		};
	}

	try {
		const user = await getOrCreateUser(passphrase);

		if (!user) {
			return { success: false, error: "Failed to create or get user" };
		}

		await setSession(user.id);

		return {
			success: true,
			user: {
				id: user.id,
				createdAt: user.createdAt,
			},
		};
	} catch (error) {
		console.error("Failed to create/get user:", error);
		return { success: false, error: "Failed to create account" };
	}
}

export async function checkAuth(): Promise<CheckAuthResult> {
	try {
		const user = await getCurrentUser();
		if (user) {
			return { authenticated: true, userId: user.id };
		}
		return { authenticated: false };
	} catch (error) {
		console.error("checkAuth error:", error);
		return { authenticated: false };
	}
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
	try {
		await clearSession();
		return { success: true };
	} catch (error) {
		console.error("signOut error:", error);
		return { success: false, error: "Failed to sign out" };
	}
}
