import { useEffect } from "react";

export default function useServiceWorker(): void {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					console.log("SW registered:", registration);
				})
				.catch((error) => {
					console.log("SW registration failed:", error);
				});
		}
	}, []);
}
