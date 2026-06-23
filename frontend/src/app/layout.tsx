import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KuraFlow | Master Japanese & English",
  description: "Experience a smarter way to learn languages with KuraFlow's adaptive SRS and gamified learning engine.",
  manifest: "/manifest.json",
  keywords: ["language learning", "japanese", "english", "spaced repetition", "srs", "gamified learning"],
  authors: [{ name: "KuraFlow Team" }],
  openGraph: {
    title: "KuraFlow | Master Japanese & English",
    description: "Experience a smarter way to learn languages with KuraFlow's adaptive SRS and gamified learning engine.",
    url: "https://kuraflow.com",
    siteName: "KuraFlow",
    images: [
      {
        url: "https://kuraflow.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KuraFlow Cover Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KuraFlow | Master Japanese & English",
    description: "Experience a smarter way to learn languages with KuraFlow's adaptive SRS and gamified learning engine.",
    images: ["https://kuraflow.com/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansJP.variable} antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
