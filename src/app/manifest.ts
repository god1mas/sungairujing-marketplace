import type { MetadataRoute } from "next";
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_SHORT_NAME,
} from "@/constants/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_SHORT_NAME,
    description: BRAND_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#166534",
    lang: "id",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
