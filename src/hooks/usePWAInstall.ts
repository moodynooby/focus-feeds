import { useEffect, useState } from "react";

type InstallStatus = "available" | "installed" | "dismissed";

interface UsePWAInstallReturn {
	deferredPrompt: Event | null;
	installStatus: InstallStatus;
	handleInstallClick: () => Promise<void>;
}

export default function usePWAInstall(): UsePWAInstallReturn {
	const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
	const [installStatus, setInstallStatus] =
		useState<InstallStatus>("available");

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setInstallStatus("available");
		};

		const handleAppInstalled = () => {
			setInstallStatus("installed");
			setDeferredPrompt(null);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		const promptEvent = deferredPrompt as Event & {
			prompt: () => void;
			userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
		};

		promptEvent.prompt();
		const { outcome } = await promptEvent.userChoice;

		if (outcome === "accepted") {
			setInstallStatus("installed");
			setDeferredPrompt(null);
		} else {
			setInstallStatus("dismissed");
		}
	};

	return { deferredPrompt, installStatus, handleInstallClick };
}
