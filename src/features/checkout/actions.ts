"use server";

import { z } from "zod";
import { revalidateCart } from "@/services/cart-validation-service";
import { prepareWhatsAppCheckout } from "@/services/checkout-service";
import type { CheckoutBuyerInput } from "./checkout-schema";

const cartItemSchema = z.object({
  productId: z.uuid(),
  merchantId: z.uuid(),
  quantity: z.number().int().min(1),
});
const cartSchema = z.array(cartItemSchema).max(100);

export const revalidateCartAction = async (input: unknown) => {
  const parsed = cartSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Data cart tidak valid.",
      validItems: [],
      invalidItems: [],
    };
  }
  try {
    const result = await revalidateCart(parsed.data);
    return { success: true as const, ...result };
  } catch {
    return {
      success: false as const,
      message: "Cart belum dapat diperbarui. Silakan coba lagi.",
      validItems: [],
      invalidItems: [],
    };
  }
};

export const prepareCheckoutAction = async (input: {
  merchantSlug: string;
  items: unknown;
  buyer: unknown;
}) => {
  const items = cartSchema.safeParse(input.items);
  if (!items.success || typeof input.buyer !== "object" || !input.buyer) {
    return { success: false as const, message: "Data checkout tidak valid." };
  }
  try {
    return await prepareWhatsAppCheckout({
      merchantSlug: input.merchantSlug,
      items: items.data,
      buyer: input.buyer as CheckoutBuyerInput,
    });
  } catch {
    return {
      success: false as const,
      message: "Checkout belum dapat diproses. Silakan coba lagi.",
    };
  }
};
