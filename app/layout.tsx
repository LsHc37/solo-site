import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import appIcon from "../app_icon.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://retrogigz.com"),
  icons: {
    icon: appIcon.src,
    shortcut: appIcon.src,
    apple: appIcon.src,
  },
  title: {
    default: "Retro Gigz | Digital Independence",
    template: "%s | Retro Gigz",
  },
  description:
    "Retro Gigz builds privacy-first software, independent games, and tactical apparel for digital independence.",
  keywords: [
    "Retro Gigz",
    "privacy-first apps",
    "offline apps",
    "indie game studio",
    "tactical apparel",
    "digital independence",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Retro Gigz",
    title: "Retro Gigz | Digital Independence",
    description:
      "Privacy-first software, independent games, and tactical apparel built for digital independence.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retro Gigz | Digital Independence",
    description:
      "Privacy-first software, independent games, and tactical apparel built for digital independence.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
