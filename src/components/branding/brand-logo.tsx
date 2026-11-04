import Image from "next/image";
import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_PATH,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/constants/branding";

export function BrandLogo({
  className,
  preload = false,
  sizes,
}: {
  className?: string;
  preload?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={BRAND_LOGO_PATH}
      alt={`Logo ${BRAND_NAME}`}
      width={BRAND_LOGO_WIDTH}
      height={BRAND_LOGO_HEIGHT}
      className={className}
      preload={preload}
      sizes={sizes}
    />
  );
}
