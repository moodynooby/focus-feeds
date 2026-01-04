import "./globals.css";
import ThemeRegistry from "./theme";
export const metadata = {
  title: "Focus Feeds",
  description: "A platform for managing and focusing on feeds.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Focus Feeds",
  },
};

export const viewport = {
  themeColor: "#1976d2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry> {children}</ThemeRegistry>
      </body>
    </html>
  );
}
