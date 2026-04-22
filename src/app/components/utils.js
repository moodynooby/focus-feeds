"use client";

/**
 * Extract hostname from a URL string safely.
 * @param {string} link - The URL to extract hostname from
 * @returns {string} The hostname or "example.com" if extraction fails
 */
export function getHostname(link) {
	try {
		return new URL(link).hostname;
	} catch (_e) {
		return "example.com";
	}
}
