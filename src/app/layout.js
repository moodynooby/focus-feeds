import "./globals.css";
import ThemeRegistry from "./theme";
export const metadata = {
  title: "Focus Feeds",
  description: "A platform for managing and focusing on feeds.",
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
