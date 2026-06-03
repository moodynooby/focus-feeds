"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import parse, {
	type DOMNode,
	type Element,
	type HTMLReactParserOptions,
} from "html-react-parser";
import Image from "next/image";

const IMAGE_PROXY_BASE = "/api/image";

function getProxiedImageUrl(src: string): string {
	if (!src) return src;
	if (src.startsWith("/") || src.startsWith("data:")) return src;
	return `${IMAGE_PROXY_BASE}?url=${encodeURIComponent(src)}`;
}

interface RSSContentProps {
	content: string;
	sx?: SxProps<Theme>;
}

export default function RSSContent({ content, sx }: RSSContentProps) {
	const options: HTMLReactParserOptions = {
		replace: (domNode: DOMNode) => {
			const element = domNode as Element;
			if (element.name === "img" && element.attribs?.src) {
				const { src, alt } = element.attribs;
				const proxiedSrc = getProxiedImageUrl(src);
				return (
					<Box
						sx={{
							position: "relative",
							width: "100%",
							minHeight: 200,
							my: 2,
						}}
					>
						<Image
							src={proxiedSrc}
							alt={alt || ""}
							fill
							style={{ objectFit: "contain", borderRadius: 8 }}
							sizes="(max-width: 768px) 100vw, 800px"
						/>
					</Box>
				);
			}
		},
	};

	return <Box sx={sx}>{parse(content, options)}</Box>;
}
