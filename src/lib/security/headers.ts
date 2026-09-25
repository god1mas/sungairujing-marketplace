export type SecurityHeader = Readonly<{
  key: string;
  value: string;
}>;

const createContentSecurityPolicy = (isDevelopment: boolean) =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");

export const createSecurityHeaders = (
  environment: "development" | "production" | "test" = process.env.NODE_ENV,
): SecurityHeader[] => [
  {
    key: "Content-Security-Policy",
    value: createContentSecurityPolicy(environment === "development"),
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
