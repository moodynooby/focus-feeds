import { useEffect, useState } from "react";
import { checkAuth, signOut as serverSignOut } from "@/app/actions";
import type { AuthStatus } from "@/types";

interface UseAuthReturn {
	status: AuthStatus;
	isAuthenticated: boolean;
	signOut: () => Promise<void>;
}

export default function useAuth(): UseAuthReturn {
	const [status, setStatus] = useState<AuthStatus>("loading");

	useEffect(() => {
		checkAuth().then((data) => {
			setStatus(data.authenticated ? "authenticated" : "unauthenticated");
		});
	}, []);

	const signOut = async () => {
		const result = await serverSignOut();
		if (result.success) {
			window.location.reload();
		} else {
			console.error("Failed to sign out:", result.error);
		}
	};

	return {
		status,
		isAuthenticated: status === "authenticated",
		signOut,
	};
}
