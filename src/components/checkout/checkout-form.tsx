"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/features/cart/cart-store";
import {
  prepareCheckoutAction,
  revalidateCartAction,
} from "@/features/checkout/actions";
import { formatRupiah } from "@/lib/format/currency";
import type { ValidatedCartItem } from "@/services/cart-validation-service";

export function CheckoutForm({ merchantSlug }: { merchantSlug: string }) {
  const { items, hasHydrated } = useCartStore();
  const [products, setProducts] = useState<ValidatedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [fulfillment, setFulfillment] = useState("AMBIL_SENDIRI");
  const [result, setResult] = useState<{
    whatsappUrl: string;
    referenceCode: string;
  } | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (items.length === 0) return;
    let active = true;
    void revalidateCartAction(items).then((response) => {
      if (!active) return;
      if (!response.success) {
        setError(response.message);
      } else {
        const selected = response.validItems.filter(
          (item) => item.merchantSlug === merchantSlug,
        );
        const selectedMerchantId = selected[0]?.merchantId;
        const hasInvalidMerchantItem = response.invalidItems.some(
          (invalidItem) =>
            selectedMerchantId &&
            items.some(
              (item) =>
                item.productId === invalidItem.productId &&
                item.merchantId === selectedMerchantId,
            ),
        );
        if (
          selected.length === 0 ||
          hasInvalidMerchantItem ||
          selected.some((item) => !item.checkoutEligible)
        ) {
          setError("Cart merchant tidak tersedia untuk checkout.");
        } else {
          setProducts(selected);
        }
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [hasHydrated, items, merchantSlug]);

  const selectedItems = useMemo(
    () =>
      items.filter((item) =>
        products.some((product) => product.productId === item.productId),
      ),
    [items, products],
  );
  const total = products.reduce(
    (sum, product) => sum + Number(product.subtotal),
    0,
  );

  if (hasHydrated && items.length === 0)
    return (
      <div
        role="alert"
        className="mt-8 rounded-lg border border-error-border bg-error-bg p-5 text-error-text"
      >
        Tidak ada produk untuk merchant ini di cart.
      </div>
    );
  if (!hasHydrated || loading)
    return <p className="mt-8 text-neutral-600">Memvalidasi cart…</p>;
  if (error || products.length === 0)
    return (
      <div
        role="alert"
        className="mt-8 rounded-lg border border-error-border bg-error-bg p-5 text-error-text"
      >
        {error || "Tidak ada produk untuk merchant ini di cart."}
      </div>
    );

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <section
        aria-labelledby="checkout-summary"
        className="rounded-lg border border-neutral-200 bg-white p-5"
      >
        <h2 id="checkout-summary" className="text-xl font-bold">
          Ringkasan Produk
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          {products[0].merchantName}
        </p>
        <ul className="mt-4 divide-y divide-neutral-200">
          {products.map((product) => (
            <li
              key={product.productId}
              className="flex justify-between gap-4 py-3"
            >
              <span>
                {product.quantity}× {product.name}
              </span>
              <span className="font-semibold">
                {formatRupiah(product.subtotal)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-neutral-200 pt-4 text-lg font-bold">
          Total estimasi: {formatRupiah(total)}
        </p>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Total di atas merupakan estimasi harga produk. Ketersediaan, ongkir,
          dan total akhir akan dikonfirmasi merchant melalui WhatsApp.
        </p>
      </section>

      <form
        className="rounded-lg border border-neutral-200 bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          setResult(null);
          const data = new FormData(event.currentTarget);
          void prepareCheckoutAction({
            merchantSlug,
            items: selectedItems,
            buyer: {
              name: data.get("name"),
              whatsappNumber: data.get("whatsappNumber"),
              fulfillmentMethod: data.get("fulfillmentMethod"),
              address: data.get("address"),
              note: data.get("note"),
            },
          }).then((response) => {
            if (response.success) {
              setFieldErrors({});
              setResult(response);
            } else {
              setError(response.message);
              setFieldErrors(response.fieldErrors ?? {});
            }
          });
        }}
      >
        <h2 className="text-xl font-bold">Data Pembeli</h2>
        <CheckoutField id="name" label="Nama" errors={fieldErrors.name} />
        <CheckoutField
          id="whatsappNumber"
          label="Nomor WhatsApp"
          errors={fieldErrors.whatsappNumber}
          inputMode="tel"
        />

        <fieldset className="mt-5">
          <legend className="font-semibold">Metode pemenuhan</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {[
              ["AMBIL_SENDIRI", "Ambil sendiri"],
              ["DIANTAR", "Diantar"],
            ].map(([value, label]) => (
              <label
                key={value}
                className="flex min-h-11 items-center gap-2 rounded-md border border-neutral-300 px-3"
              >
                <input
                  type="radio"
                  name="fulfillmentMethod"
                  value={value}
                  checked={fulfillment === value}
                  onChange={() => setFulfillment(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {fulfillment === "DIANTAR" ? (
          <div className="mt-5">
            <label htmlFor="address" className="font-semibold">
              Alamat/lokasi
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              aria-describedby={
                fieldErrors.address ? "address-error" : undefined
              }
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            />
            {fieldErrors.address ? (
              <p id="address-error" className="mt-1 text-sm text-error-text">
                {fieldErrors.address[0]}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5">
          <label htmlFor="note" className="font-semibold">
            Catatan (opsional)
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-error-text">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="mt-6 min-h-11 w-full rounded-md bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700"
        >
          Siapkan WhatsApp
        </button>

        {result ? (
          <div className="mt-5 rounded-md border border-success-border bg-success-bg p-4">
            <p className="text-sm text-success-text">
              Kode komunikasi: <strong>{result.referenceCode}</strong>
            </p>
            <a
              href={result.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center rounded-md bg-brand-600 px-5 font-semibold text-white"
            >
              Lanjut ke WhatsApp
            </a>
          </div>
        ) : null}
      </form>
    </div>
  );
}

function CheckoutField({
  id,
  label,
  errors,
  inputMode,
}: {
  id: string;
  label: string;
  errors?: string[];
  inputMode?: "tel";
}) {
  return (
    <div className="mt-5">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={id}
        inputMode={inputMode}
        aria-describedby={errors ? `${id}-error` : undefined}
        className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3"
      />
      {errors ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-error-text">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
