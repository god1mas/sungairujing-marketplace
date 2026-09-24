import "server-only";

import { Prisma } from "@prisma/client";
import type { CartItem } from "@/features/cart/cart-store";
import {
  checkoutBuyerSchema,
  type CheckoutBuyerInput,
} from "@/features/checkout/checkout-schema";
import {
  findProductsForCartValidation,
  type CheckoutProductRecord,
} from "@/repositories/checkout-repository";
import { revalidateCart } from "./cart-validation-service";
import {
  buildCheckoutMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp/build-checkout-message";
import { generateReferenceCode } from "@/lib/whatsapp/reference-code";

export type CheckoutPreparationResult =
  | {
      success: true;
      whatsappUrl: string;
      referenceCode: string;
      estimatedTotal: string;
    }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

export const prepareWhatsAppCheckout = async (
  input: {
    merchantSlug: string;
    items: CartItem[];
    buyer: CheckoutBuyerInput;
  },
  dependencies: {
    findProducts?: (ids: string[]) => Promise<CheckoutProductRecord[]>;
    referenceCode?: () => string;
  } = {},
): Promise<CheckoutPreparationResult> => {
  const buyer = checkoutBuyerSchema.safeParse(input.buyer);
  if (!buyer.success) {
    return {
      success: false,
      message: "Periksa kembali data checkout.",
      fieldErrors: buyer.error.flatten().fieldErrors,
    };
  }
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.merchantSlug) ||
    input.items.length === 0
  ) {
    return { success: false, message: "Cart merchant tidak valid." };
  }

  const findProducts =
    dependencies.findProducts ?? findProductsForCartValidation;
  const records = await findProducts(input.items.map((item) => item.productId));
  const validation = await revalidateCart(input.items, {
    findProducts: async () => records,
    resolveImageUrl: () => null,
  });
  if (
    validation.invalidItems.length > 0 ||
    validation.validItems.length !== input.items.length ||
    validation.validItems.some(
      (item) =>
        !item.checkoutEligible || item.merchantSlug !== input.merchantSlug,
    )
  ) {
    return {
      success: false,
      message:
        "Sebagian produk tidak lagi tersedia untuk checkout. Perbarui cart Anda.",
    };
  }

  const merchant = records[0]?.merchant;
  if (
    !merchant ||
    merchant.slug !== input.merchantSlug ||
    !/^62\d{8,15}$/.test(merchant.publicWhatsappNumber)
  ) {
    return { success: false, message: "Kontak merchant tidak tersedia." };
  }

  const total = validation.validItems.reduce(
    (sum, item) => sum.plus(item.subtotal),
    new Prisma.Decimal(0),
  );
  const referenceCode = (dependencies.referenceCode ?? generateReferenceCode)();
  const message = buildCheckoutMessage({
    merchantName: merchant.name,
    items: validation.validItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    total: total.toFixed(2),
    buyer: buyer.data,
    referenceCode,
  });

  return {
    success: true,
    whatsappUrl: buildWhatsAppUrl(merchant.publicWhatsappNumber, message),
    referenceCode,
    estimatedTotal: total.toFixed(2),
  };
};
