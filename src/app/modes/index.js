import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

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
		nextMode: "classic",
		fabTooltip: "Switch to Classic Mode",
		fabAriaLabel: "classic-mode",
		hasSidebar: true,
		hasInlineArticleView: true,
		hasStarring: true,
	},
};

export const MODE_NAMES = Object.keys(MODE_CONFIG);
