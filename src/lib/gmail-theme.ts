import { createTheme } from "@mui/material/styles";
import { createGmailDesignTokens } from "./design-tokens";

export const gmailTheme = (mode: "light" | "dark") => {
	const designTokens = createGmailDesignTokens(mode);
	return createTheme(designTokens);
};
