import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Shared styles for article content (RSSContent) across ReaderView and GmailArticleView.
 */
export const articleContentStyles: SxProps<Theme> = {
	lineHeight: 1.8,
	fontSize: { xs: "1rem", md: "1.125rem" },
	color: "text.primary",
	"& h1, & h2, & h3, & h4": {
		mt: 3,
		mb: 1.5,
		fontWeight: 600,
		lineHeight: 1.3,
	},
	"& h1": { fontSize: "1.75rem" },
	"& h2": { fontSize: "1.5rem" },
	"& h3": { fontSize: "1.25rem" },
	"& p": { mb: 2 },
	"& a": {
		color: "primary.main",
		textDecoration: "underline",
		textUnderlineOffset: "2px",
	},
	"& a:hover": { opacity: 0.8 },
	"& ul, & ol": { mb: 2, pl: 4 },
	"& li": { mb: 1 },
	"& blockquote": {
		borderLeft: "4px solid",
		borderColor: "divider",
		pl: 3,
		ml: 0,
		my: 3,
		color: "text.secondary",
		fontStyle: "italic",
		py: 1,
	},
	"& pre": {
		bgcolor: "action.hover",
		p: 3,
		borderRadius: 2,
		overflowX: "auto",
		fontFamily: "monospace",
		fontSize: "0.875rem",
		lineHeight: 1.6,
		my: 3,
	},
	"& code": {
		fontFamily: "monospace",
		fontSize: "0.875em",
		bgcolor: "action.hover",
		px: 0.5,
		py: 0.25,
		borderRadius: 0.5,
	},
	"& pre code": {
		bgcolor: "transparent",
		p: 0,
	},
	"& img": {
		maxWidth: "100%",
		height: "auto",
		borderRadius: 2,
		my: 3,
	},
	"& figure": {
		my: 3,
		mx: 0,
	},
	"& figcaption": {
		textAlign: "center",
		fontSize: "0.875rem",
		color: "text.secondary",
		mt: 1,
	},
	"& hr": {
		my: 4,
		border: "none",
		borderTop: "1px solid",
		borderColor: "divider",
	},
	"& table": {
		width: "100%",
		borderCollapse: "collapse",
		my: 3,
	},
	"& th, & td": {
		border: "1px solid",
		borderColor: "divider",
		p: 1.5,
		textAlign: "left",
	},
	"& th": {
		fontWeight: 600,
		bgcolor: "action.hover",
	},
};
