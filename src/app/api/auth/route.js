import {
	clearSession,
	getCurrentUser,
	getOrCreateUser,
	setSession,
} from "@/lib/simple-auth";

/**
 * GET /api/auth - Check if user is authenticated
 */
export async function GET() {
	try {
		const user = await getCurrentUser();

		if (user) {
			return Response.json({
				authenticated: true,
				userId: user.id,
			});
		}

		return Response.json({
			authenticated: false,
		});
	} catch (error) {
		console.error("Auth GET error:", error);
		return Response.json(
			{ authenticated: false, error: "Failed to check session" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/auth - Validate/create passphrase, set session cookie
 */
export async function POST(request) {
	try {
		const { passphrase } = await request.json();

		if (!passphrase || passphrase.trim() === "") {
			return Response.json(
				{ success: false, error: "Passphrase is required" },
				{ status: 400 },
			);
		}

		const user = await getOrCreateUser(passphrase);

		if (!user) {
			return Response.json(
				{ success: false, error: "Failed to authenticate" },
				{ status: 500 },
			);
		}

		await setSession(user.id);

		return Response.json({
			success: true,
			user: {
				id: user.id,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		console.error("Auth POST error:", error);
		return Response.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/auth - Clear session cookie (logout)
 */
export async function DELETE() {
	try {
		await clearSession();
		return Response.json({ success: true });
	} catch (error) {
		console.error("Auth DELETE error:", error);
		return Response.json(
			{ success: false, error: "Failed to logout" },
			{ status: 500 },
		);
	}
}
