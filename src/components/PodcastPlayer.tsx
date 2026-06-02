"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { PODCAST_ACCENT, PODCAST_ACCENT_RGB } from "@/lib/theme";

const Plyr = dynamic(
	// biome-ignore lint/suspicious/noExplicitAny: plyr-react module export is dynamic
	() => import("plyr-react").then((mod: any) => mod.Plyr || mod.default),
	{ ssr: false },
) as ComponentType<{
	source: { type: string; sources: Array<{ src: string; type: string }> };
	options: { controls: string[] };
}>;

interface PodcastPlayerProps {
	audioUrl: string | null;
	audioType?: string;
}

export default function PodcastPlayer({
	audioUrl,
	audioType = "audio/mpeg",
}: PodcastPlayerProps) {
	const theme = useTheme();
	if (!audioUrl) return null;

	const plyrSource = {
		type: "audio" as const,
		sources: [
			{
				src: audioUrl,
				type: audioType,
			},
		],
	};

	const plyrOptions = {
		controls: [
			"play",
			"progress",
			"current-time",
			"duration",
			"mute",
			"volume",
		],
	};

	return (
		<Box
			sx={{
				mt: 2,
				"& .plyr": {
					"--plyr-color-main": PODCAST_ACCENT,
					"--plyr-audio-controls-background": theme.palette.background.paper,
					"--plyr-audio-control-color": theme.palette.text.primary,
					"--plyr-audio-control-color-hover": PODCAST_ACCENT,
					"--plyr-range-fill-background": PODCAST_ACCENT,
					"--plyr-audio-progress-buffered-background": `rgba(${PODCAST_ACCENT_RGB}, 0.25)`,
					"--plyr-range-thumb-background": theme.palette.text.primary,
					"--plyr-range-thumb-shadow": "none",
					borderRadius: "12px",
					overflow: "hidden",
				},
				"& .plyr__controls": {
					padding: "12px 16px",
					borderRadius: "12px",
				},
				"& .plyr__progress__container": {
					flex: 1,
				},
				"& .plyr__time": {
					fontSize: "0.8rem",
					fontFamily: "monospace",
				},
			}}
		>
			<Plyr source={plyrSource} options={plyrOptions} />
		</Box>
	);
}
