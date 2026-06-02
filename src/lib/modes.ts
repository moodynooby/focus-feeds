import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import MailIcon from "@mui/icons-material/Mail";
import TagIcon from "@mui/icons-material/Tag";
import type { ElementType } from "react";
import type { AppMode } from "@/types";

interface ModeConfig {
	name: string;
	icon: ElementType;
	hasSidebar: boolean;
	hasInlineArticleView: boolean;
	hasStarring: boolean;
}

export const MODE_CONFIG: Record<AppMode, ModeConfig> = {
	classic: {
		name: "Classic",
		icon: AutoFixHighIcon,
		hasSidebar: false,
		hasInlineArticleView: false,
		hasStarring: false,
	},
	gmail: {
		name: "Gmail",
		icon: MailIcon,
		hasSidebar: true,
		hasInlineArticleView: true,
		hasStarring: true,
	},
	twitter: {
		name: "Twitter",
		icon: TagIcon,
		hasSidebar: false,
		hasInlineArticleView: false,
		hasStarring: false,
	},
};

export const MODE_NAMES = Object.keys(MODE_CONFIG) as AppMode[];
