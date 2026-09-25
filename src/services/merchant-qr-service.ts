import "server-only";

import QRCode from "qrcode";
import { buildCanonicalPublicUrl } from "@/lib/canonical-url";
import { isSafeMerchantSlug } from "./public-merchant-service";

export const createMerchantQr = async (slug: string) => {
  if (!isSafeMerchantSlug(slug)) return null;
  const url = buildCanonicalPublicUrl(`/merchant/${encodeURIComponent(slug)}`);
  if (!url) return null;
  const dataUrl = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#166534", light: "#ffffff" },
  });
  return { url, dataUrl };
};
