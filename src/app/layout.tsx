import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    statusBarStyle: "default",
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
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional favicon formats for maximum compatibility */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
