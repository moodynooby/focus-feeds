"use client";

import Box from "@mui/material/Box";
import parse from "html-react-parser";
import Image from "next/image";

const IMAGE_PROXY_BASE = "/api/image";

function getProxiedImageUrl(src) {
	if (!src) return src;
	if (src.startsWith("/") || src.startsWith("data:")) return src;
	return `${IMAGE_PROXY_BASE}?url=${encodeURIComponent(src)}`;
}

export default function RSSContent({ content, sx }) {
	const options = {
		replace: (domNode) => {
			if (domNode.name === "img" && domNode.attribs?.src) {
				const { src, alt } = domNode.attribs;
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
