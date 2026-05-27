import { format } from "date-fns";

export function getHostname(link) {
	try {
		return new URL(link).hostname;
	} catch (_e) {
		return "example.com";
	}
}

export function toggleListItem(arr, item) {
	return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function formatDuration(duration) {
	if (!duration) return null;
	if (String(duration).includes(":")) return duration;
	const secs = parseInt(duration, 10);
	if (Number.isNaN(secs)) return duration;
	const hours = Math.floor(secs / 3600);
	const mins = Math.floor((secs % 3600) / 60);
	const remainingSecs = secs % 60;
	if (hours > 0) {
		return `${hours}:${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
	}
	return `${mins}:${String(remainingSecs).padStart(2, "0")}`;
}

export function formatDate(date, preset = "iso") {
	if (!date) return "Unknown date";
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "Unknown date";
	if (preset === "short") return format(d, "MMM d");
	if (preset === "long") return format(d, "PPpp");
	return format(d, "yyyy-MM-dd");
}
