import type { LucideIcon } from "lucide-react";
import { Hash, Mail, Sparkles } from "lucide-react";
import type { AppMode } from "@/types";

interface ModeConfig {
	name: string;
	icon: LucideIcon;
	hasSidebar: boolean;
	hasInlineArticleView: boolean;
	hasStarring: boolean;
}

export const MODE_CONFIG: Record<AppMode, ModeConfig> = {
	classic: {
		name: "Classic",
		icon: Sparkles,
		hasSidebar: false,
		hasInlineArticleView: false,
		hasStarring: false,
	},
	gmail: {
		name: "Gmail",
		icon: Mail,
		hasSidebar: true,
		hasInlineArticleView: true,
		hasStarring: true,
	},
	twitter: {
		name: "Twitter",
		icon: Hash,
		hasSidebar: true,
		hasInlineArticleView: false,
		hasStarring: false,
	},
};

export const MODE_NAMES = Object.keys(MODE_CONFIG) as AppMode[];
