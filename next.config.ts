import type { NextConfig } from "next";

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
  images: {
    remotePatterns: publicMediaPattern ? [publicMediaPattern] : [],
  },
};

export default nextConfig;
