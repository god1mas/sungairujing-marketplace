"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { revalidateCartAction } from "@/features/checkout/actions";
import { useCartStore } from "@/features/cart/cart-store";
import { formatRupiah } from "@/lib/format/currency";
import type { ValidatedCartItem } from "@/services/cart-validation-service";

const invalidMessage = {
  NOT_FOUND: "Produk sudah tidak tersedia.",
  PRODUCT_UNAVAILABLE: "Produk tidak tersedia untuk publik.",
  MERCHANT_UNAVAILABLE: "Merchant sedang tidak tersedia.",
  MERCHANT_MISMATCH: "Data merchant produk tidak sesuai.",
  OUT_OF_STOCK: "Produk sedang habis.",
  INVALID_QUANTITY: "Quantity produk tidak valid.",
} as const;

export function CartPageClient() {
  const { items, hasHydrated, removeItem, updateQuantity } = useCartStore();
  const itemKey = items
    .map((item) => `${item.productId}:${item.merchantId}:${item.quantity}`)
    .join("|");
  const [validation, setValidation] = useState<{
    key: string;
    validated: ValidatedCartItem[];
    invalid: { productId: string; reason: keyof typeof invalidMessage }[];
    error: boolean;
  } | null>(null);

  useEffect(() => {
    if (!hasHydrated || items.length === 0) return;
    let active = true;
    void revalidateCartAction(items).then((result) => {
      if (!active) return;
      if (result.success) {
        setValidation({
          key: itemKey,
          validated: result.validItems,
          invalid: result.invalidItems,
          error: false,
        });
      } else {
        setValidation({
          key: itemKey,
          validated: [],
          invalid: [],
          error: true,
        });
      }
    });
    return () => {
      active = false;
    };
  }, [hasHydrated, itemKey, items]);

  if (!hasHydrated)
    return <p className="mt-8 text-neutral-600">Memuat cart…</p>;
  if (items.length === 0)
    return (
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <h2 className="text-xl font-bold">Cart masih kosong</h2>
        <p className="mt-2 text-neutral-600">Tambahkan produk dari katalog.</p>
        <Link
          href="/products"
          className="mt-5 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 font-semibold text-white"
        >
          Jelajahi Produk
        </Link>
      </div>
    );
  if (!validation || validation.key !== itemKey)
    return <p className="mt-8 text-neutral-600">Memperbarui data cart…</p>;
  if (validation.error)
    return (
      <p role="alert" className="mt-8 text-error-text">
        Cart belum dapat diperbarui. Silakan coba lagi.
      </p>
    );

  const groups = new Map<string, ValidatedCartItem[]>();
  for (const item of validation.validated) {
    const group = groups.get(item.merchantId) ?? [];
    group.push(item);
    groups.set(item.merchantId, group);
  }

  return (
    <div className="mt-8 space-y-8">
      {validation.invalid.map((item) => (
        <div
          key={item.productId}
          role="alert"
          className="rounded-lg border border-error-border bg-error-bg p-4 text-error-text"
        >
          <p>{invalidMessage[item.reason]}</p>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="mt-2 min-h-11 font-semibold underline"
          >
            Hapus item tidak valid
          </button>
        </div>
      ))}

      {[...groups.entries()].map(([merchantId, group]) => {
        const total = group.reduce(
          (sum, item) => sum + Number(item.subtotal),
          0,
        );
        const canCheckout = group.every((item) => item.checkoutEligible);
        return (
          <section
            key={merchantId}
            aria-labelledby={`merchant-${merchantId}`}
            className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <h2 id={`merchant-${merchantId}`} className="text-xl font-bold">
              {group[0].merchantName}
            </h2>
            <div className="mt-4 divide-y divide-neutral-200">
              {group.map((item) => (
                <article key={item.productId} className="flex gap-4 py-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {item.image ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.alt}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center px-2 text-center text-xs text-neutral-500">
                        Foto tidak tersedia
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-neutral-600">
                      {formatRupiah(item.price)} / {item.unit}
                    </p>
                    {item.availability === "HABIS" ? (
                      <p className="mt-1 text-sm font-semibold text-warning-text">
                        Habis — hapus item untuk melanjutkan checkout.
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Kurangi quantity ${item.name}`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="size-11 rounded-md border border-neutral-300 disabled:opacity-50"
                      >
                        −
                      </button>
                      <span
                        aria-label={`Quantity ${item.name}`}
                        className="min-w-8 text-center font-semibold"
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Tambah quantity ${item.name}`}
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="size-11 rounded-md border border-neutral-300"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="min-h-11 px-2 font-semibold text-error-text"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold">
                    {formatRupiah(item.subtotal)}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-4">
              <p className="font-bold">Subtotal: {formatRupiah(total)}</p>
              {canCheckout ? (
                <Link
                  href={`/checkout/${group[0].merchantSlug}`}
                  className="inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 font-semibold text-white"
                >
                  Checkout {group[0].merchantName}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-warning-text">
                  Hapus produk habis untuk melanjutkan.
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
