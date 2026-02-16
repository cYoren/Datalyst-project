import type { Metadata, Viewport } from "next";
import { Crimson_Pro, DM_Sans } from "next/font/google";
import "./globals.css";
import { CookieNotice } from "@/components/ui/CookieNotice";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ThemeSync } from "@/components/ui/ThemeSync";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Datalyst | N=1 Self-Experimentation Platform",
  description: "Run personal experiments. Track protocols. Discover what actually works for you through data-driven self-optimization.",
  keywords: ["self-tracking", "quantified self", "personal experiments", "habit tracking", "data correlation", "N=1", "self-optimization"],
  authors: [{ name: "Datalyst" }],
  creator: "Datalyst",
  manifest: "/manifest.json",
  metadataBase: new URL("https://datalyst.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Datalyst",
    title: "Datalyst | Your Personal Experiment Lab",
    description: "Stop guessing what works. Start testing with data. Run N=1 experiments to discover correlations in your daily life.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Datalyst | N=1 Self-Experimentation",
    description: "Track protocols. Find correlations. Build your own instruction manual based on evidence from your life.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Datalyst",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F766E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${crimsonPro.variable} font-[family-name:var(--font-body)]`} suppressHydrationWarning>
        <ThemeSync />
        <ServiceWorkerRegister />
        {children}
        <CookieNotice />
      </body>
    </html>
  );
}
