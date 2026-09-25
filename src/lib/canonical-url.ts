export const buildCanonicalPublicUrl = (
  path: string,
  appUrl = process.env.APP_URL,
): string | null => {
  if (!appUrl || !path.startsWith("/") || path.startsWith("//")) return null;
  try {
    const base = new URL(appUrl);
    if (!/^https?:$/.test(base.protocol)) return null;
    return new URL(path, `${base.origin}/`).toString();
  } catch {
    return null;
  }
};
