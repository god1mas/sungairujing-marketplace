import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { InstallAffordance } from "@/components/pwa/install-affordance";
import {
  BRAND_DESCRIPTION,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_PATH,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/constants/branding";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  openGraph: {
    siteName: BRAND_NAME,
    title: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: BRAND_LOGO_PATH,
        width: BRAND_LOGO_WIDTH,
        height: BRAND_LOGO_HEIGHT,
        alt: `Logo ${BRAND_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    images: [BRAND_LOGO_PATH],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
        <InstallAffordance />
      </body>
    </html>
  );
}
