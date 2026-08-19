import type { Metadata, Viewport } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import AmbientBackground from "@/components/ui/AmbientBackground";

const display = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display-family",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Imposter — one phone, one secret",
  description:
    "A pass-the-phone party game for 3–12 players. Everyone gets the secret word. Someone doesn't.",
  applicationName: "Imposter",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Imposter" },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#05061a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <AmbientBackground />
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
