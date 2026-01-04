"use client";

import Box from "@mui/material/Box";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with plyr-react
const Plyr = dynamic(
  () => import("plyr-react").then((mod) => mod.Plyr || mod.default),
  { ssr: false },
);

export default function PodcastPlayer({ audioUrl, audioType = "audio/mpeg" }) {
  if (!audioUrl) return null;

  const plyrSource = {
    type: "audio",
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
          "--plyr-color-main": "#a855f7",
          "--plyr-audio-controls-background": "#18181b",
          "--plyr-audio-control-color": "#fafafa",
          "--plyr-audio-control-color-hover": "#a855f7",
          "--plyr-range-fill-background": "#a855f7",
          "--plyr-audio-progress-buffered-background":
            "rgba(168, 85, 247, 0.25)",
          "--plyr-range-thumb-background": "#fff",
          "--plyr-range-thumb-shadow": "0 1px 4px rgba(0, 0, 0, 0.4)",
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
