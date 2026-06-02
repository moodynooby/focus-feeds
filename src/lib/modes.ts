import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TagIcon from "@mui/icons-material/Tag";

export const MODE_CONFIG = {
	classic: {
		name: "Classic",
		icon: AutoFixHighIcon,
		nextMode: "gmail",
		fabTooltip: "Switch to Gmail Mode",
		fabAriaLabel: "gmail-mode",
		hasSidebar: false,
		hasInlineArticleView: false,
		hasStarring: false,
	},
	gmail: {
		name: "Gmail",
		icon: AutoFixHighIcon,
		nextMode: "twitter",
		fabTooltip: "Switch to Twitter Mode",
		fabAriaLabel: "twitter-mode",
		hasSidebar: true,
		hasInlineArticleView: true,
		hasStarring: true,
	},
	twitter: {
		name: "Twitter",
		icon: TagIcon,
		nextMode: "classic",
		fabTooltip: "Switch to Classic Mode",
		fabAriaLabel: "classic-mode",
		hasSidebar: false,
		hasInlineArticleView: false,
		hasStarring: false,
	},
};

export const MODE_NAMES = Object.keys(MODE_CONFIG);
