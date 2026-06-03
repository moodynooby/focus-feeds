import { cookies } from "next/headers";
import { sql } from "@/lib/db";

const SESSION_COOKIE_NAME = "focus-feeds-session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

interface UserRecord {
	id: string;
	passphrase: string;
	createdAt: string;
}

async function hashPassphrase(passphrase: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(passphrase);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getOrCreateUser(
	passphrase: string,
): Promise<UserRecord | null> {
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
			return existingUsers[0] as UserRecord;
		}

		const newUsers = await sql`
      INSERT INTO "User" (id, passphrase, "createdAt")
      VALUES (gen_random_uuid(), ${hashedPassphrase}, NOW())
      RETURNING id, passphrase, "createdAt"
    `;

		return newUsers[0] as UserRecord;
	} catch (error) {
		console.error("Error in getOrCreateUser:", error);
		return null;
	}
}

export async function setSession(userId: string): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, userId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: SESSION_MAX_AGE,
		path: "/",
	});
}

export async function clearSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<UserRecord | null> {
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
		return (users[0] as UserRecord) || null;
	} catch (error) {
		console.error("Error getting current user:", error);
		return null;
	}
}

export async function isAuthenticated(): Promise<boolean> {
	const user = await getCurrentUser();
	return user !== null;
}
