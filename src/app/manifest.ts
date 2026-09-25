import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sungairujing Marketplace",
    short_name: "Sungairujing",
    description: "Marketplace lokal UMKM Desa Sungairujing.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#166534",
    lang: "id",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
