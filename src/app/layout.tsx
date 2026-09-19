import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/AuthProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import { MetaPixel } from "@/components/MetaPixel";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ weight: "400", subsets: ["latin"], variable: "--font-playfair" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "https://residencyphoto.com"),
  title: "ResidencyPhoto — Your residency headshot, done right",
  description:
    "Resize and compress your photo to exact AAMC ERAS specifications: 2.5 x 3.5 in at 150 DPI, under 150 KB. One upload, one download.",
  applicationName: "ResidencyPhoto",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ResidencyPhoto — Your residency headshot, done right",
    description:
      "Resize and compress your photo to exact AAMC ERAS specifications. One upload, one download.",
    url: "/",
    siteName: "ResidencyPhoto",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ResidencyPhoto — Your residency headshot, done right",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResidencyPhoto — Your residency headshot, done right",
    description:
      "Resize and compress your photo to exact AAMC ERAS specifications. One upload, one download.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F8FAFC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning data-scroll-behavior="smooth" lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="relative">
        <a href="#main-content" className="skip-link">
          Skip to Main Content
        </a>
        <PostHogProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </PostHogProvider>
        <Analytics />
        <MetaPixel />
      </body>
    </html>
  );
}
