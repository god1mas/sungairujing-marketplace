import "server-only";

import {
  findProductsForCartValidation,
  isCheckoutProductPublic,
  type CheckoutProductRecord,
} from "@/repositories/checkout-repository";
import { resolvePublicImageUrl } from "./public-catalog-service";
import type { CartItem } from "@/features/cart/cart-store";

export type InvalidCartReason =
  | "NOT_FOUND"
  | "PRODUCT_UNAVAILABLE"
  | "MERCHANT_UNAVAILABLE"
  | "MERCHANT_MISMATCH"
  | "OUT_OF_STOCK"
  | "INVALID_QUANTITY";

export type ValidatedCartItem = {
  productId: string;
  merchantId: string;
  merchantSlug: string;
  merchantName: string;
  name: string;
  price: string;
  unit: string;
  quantity: number;
  subtotal: string;
  availability: "TERSEDIA" | "HABIS";
  image: { url: string; alt: string } | null;
  checkoutEligible: boolean;
  invalidReason?: InvalidCartReason;
};

export type CartValidationResult = {
  validItems: ValidatedCartItem[];
  invalidItems: { productId: string; reason: InvalidCartReason }[];
};

type ProductFinder = (ids: string[]) => Promise<CheckoutProductRecord[]>;

export const revalidateCart = async (
  items: CartItem[],
  dependencies: {
    findProducts?: ProductFinder;
    resolveImageUrl?: (key: string) => string | null;
  } = {},
): Promise<CartValidationResult> => {
  const uniqueItems = new Map(items.map((item) => [item.productId, item]));
  const normalized = [...uniqueItems.values()];
  const records = await (
    dependencies.findProducts ?? findProductsForCartValidation
  )(normalized.map((item) => item.productId));
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const imageUrl = dependencies.resolveImageUrl ?? resolvePublicImageUrl;
  const validItems: ValidatedCartItem[] = [];
  const invalidItems: CartValidationResult["invalidItems"] = [];

  for (const item of normalized) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      invalidItems.push({
        productId: item.productId,
        reason: "INVALID_QUANTITY",
      });
      continue;
    }
    const record = recordsById.get(item.productId);
    if (!record) {
      invalidItems.push({ productId: item.productId, reason: "NOT_FOUND" });
      continue;
    }
    if (record.merchant.id !== item.merchantId) {
      invalidItems.push({
        productId: item.productId,
        reason: "MERCHANT_MISMATCH",
      });
      continue;
    }
    if (record.merchant.status !== "ACTIVE") {
      invalidItems.push({
        productId: item.productId,
        reason: "MERCHANT_UNAVAILABLE",
      });
      continue;
    }
    if (!isCheckoutProductPublic(record)) {
      invalidItems.push({
        productId: item.productId,
        reason: "PRODUCT_UNAVAILABLE",
      });
      continue;
    }

    const cover = record.images[0];
    const url = cover ? imageUrl(cover.storageKey) : null;
    const outOfStock = record.availabilityStatus === "HABIS";
    validItems.push({
      productId: record.id,
      merchantId: record.merchant.id,
      merchantSlug: record.merchant.slug,
      merchantName: record.merchant.name,
      name: record.name,
      price: record.price.toFixed(2),
      unit: record.unit,
      quantity: item.quantity,
      subtotal: record.price.mul(item.quantity).toFixed(2),
      availability: record.availabilityStatus,
      image: url ? { url, alt: cover?.altText ?? `Foto ${record.name}` } : null,
      checkoutEligible: !outOfStock,
      ...(outOfStock ? { invalidReason: "OUT_OF_STOCK" as const } : {}),
    });
  }

  return { validItems, invalidItems };
};
