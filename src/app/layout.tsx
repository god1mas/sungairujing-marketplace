import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Sungairujing Marketplace",
    template: "%s | Sungairujing Marketplace",
  },
  description:
    "Marketplace lokal untuk menemukan produk UMKM Desa Sungairujing.",
  openGraph: {
    siteName: "Sungairujing Marketplace",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
