import { NextResponse } from "next/server";

const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"image/avif",
	"image/bmp",
	"image/tiff",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const imageUrl = searchParams.get("url");

	if (!imageUrl) {
		return NextResponse.json(
			{ error: "Missing url parameter" },
			{ status: 400 },
		);
	}

	try {
		const url = new URL(imageUrl);
		if (!["http:", "https:"].includes(url.protocol)) {
			return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);

		const response = await fetch(imageUrl, {
			signal: controller.signal,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (compatible; FocusFeeds/1.0; +https://focus-feeds.com)",
			},
		});

		clearTimeout(timeout);

		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch image" },
				{ status: response.status },
			);
		}

		const contentType = response.headers.get("content-type");
		if (
			contentType &&
			!ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())
		) {
			return NextResponse.json(
				{ error: "Invalid content type" },
				{ status: 400 },
			);
		}

		const buffer = await response.arrayBuffer();

		if (buffer.byteLength > MAX_IMAGE_SIZE) {
			return NextResponse.json({ error: "Image too large" }, { status: 413 });
		}

		return new NextResponse(buffer, {
			headers: {
				"Content-Type": contentType || "image/jpeg",
				"Cache-Control":
					"public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
				"Content-Length": buffer.byteLength.toString(),
			},
		});
	} catch (error) {
		if (error.name === "AbortError") {
			return NextResponse.json({ error: "Request timeout" }, { status: 504 });
		}
		return NextResponse.json(
			{ error: "Failed to proxy image" },
			{ status: 500 },
		);
	}
}
