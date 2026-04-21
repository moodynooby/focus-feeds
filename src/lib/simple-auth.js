import { cookies } from "next/headers";
import { sql } from "./db";

const SESSION_COOKIE_NAME = "focus-feeds-session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * Hash a passphrase using SHA-256 for deterministic lookup
 * This is NOT for password security but for consistent user lookup
 */
async function hashPassphrase(passphrase) {
	const encoder = new TextEncoder();
	const data = encoder.encode(passphrase);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Get or create a user by passphrase
 * Returns the user object or null if passphrase is empty
 */
export async function getOrCreateUser(passphrase) {
	if (!passphrase || passphrase.trim() === "") {
		return null;
	}

	const hashedPassphrase = await hashPassphrase(passphrase.trim());

	try {
		const existingUsers = await sql`
      SELECT id, passphrase, "createdAt" FROM "User"
      WHERE passphrase = ${hashedPassphrase}
      LIMIT 1
    `;

		if (existingUsers.length > 0) {
			return existingUsers[0];
		}

		const newUsers = await sql`
      INSERT INTO "User" (id, passphrase, "createdAt")
      VALUES (gen_random_uuid(), ${hashedPassphrase}, NOW())
      RETURNING id, passphrase, "createdAt"
    `;

		return newUsers[0];
	} catch (error) {
		console.error("Error in getOrCreateUser:", error);
		return null;
	}
}

/**
 * Set session cookie for user
 */
export async function setSession(userId) {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, userId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: SESSION_MAX_AGE,
		path: "/",
	});
}

/**
 * Clear session cookie (logout)
 */
export async function clearSession() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current user from session
 * Returns user object or null if not authenticated
 */
export async function getCurrentUser() {
	const cookieStore = await cookies();
	const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

	if (!userId) {
		return null;
	}

	try {
		const users = await sql`
      SELECT id, passphrase, "createdAt" FROM "User"
      WHERE id = ${userId}
      LIMIT 1
    `;
		return users[0] || null;
	} catch (error) {
		console.error("Error getting current user:", error);
		return null;
	}
}

/**
 * Check if user is authenticated
 * Returns true if session exists and is valid
 */
export async function isAuthenticated() {
	const user = await getCurrentUser();
	return user !== null;
}
