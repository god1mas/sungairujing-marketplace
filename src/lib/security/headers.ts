export type SecurityHeader = Readonly<{
  key: string;
  value: string;
}>;

const LOCAL_STORAGE_HOSTNAMES = new Set(["127.0.0.1", "localhost", "[::1]"]);

const getLocalStorageOrigin = (supabaseUrl: string | undefined) => {
  if (!supabaseUrl) return null;

  try {
    const url = new URL(supabaseUrl);
    if (
      url.protocol !== "http:" ||
      !LOCAL_STORAGE_HOSTNAMES.has(url.hostname)
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
};

const createContentSecurityPolicy = (
  isDevelopment: boolean,
  supabaseUrl: string | undefined,
) => {
  const imageSources = ["'self'", "data:", "blob:", "https:"];
  const localStorageOrigin = isDevelopment
    ? getLocalStorageOrigin(supabaseUrl)
    : null;

  if (localStorageOrigin) imageSources.push(localStorageOrigin);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources.join(" ")}`,
    "font-src 'self' data:",
    `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");
};

export const createSecurityHeaders = (
  environment: "development" | "production" | "test" = process.env.NODE_ENV,
  supabaseUrl: string | undefined = process.env.SUPABASE_URL,
): SecurityHeader[] => [
  {
    key: "Content-Security-Policy",
    value: createContentSecurityPolicy(
      environment === "development",
      supabaseUrl,
    ),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
];
