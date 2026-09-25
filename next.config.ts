import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: false,
  reloadOnOnline: false,
  globPublicPatterns: ["icons/*"],
});

const supabaseUrl = process.env.SUPABASE_URL;
let publicMediaPattern: URL | undefined;

if (supabaseUrl) {
  try {
    publicMediaPattern = new URL("/storage/v1/object/public/**", supabaseUrl);
  } catch {
    publicMediaPattern = undefined;
  }
}

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: publicMediaPattern ? [publicMediaPattern] : [],
  },
};

export default withSerwist(nextConfig);
