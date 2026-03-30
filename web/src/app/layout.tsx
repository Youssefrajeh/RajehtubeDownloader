import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "RajehTube Downloader | Premium Video Downloader",
  description: "Download high-quality YouTube videos and playlists with RajehTube. Fast, secure, and modern.",
  keywords: ["youtube downloader", "video downloader", "mp3 downloader", "playlist downloader", "rajehtube"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
