"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/features/cart/cart-store";

export function AddToCart({
  productId,
  merchantId,
  disabled,
}: {
  productId: string;
  merchantId: string;
  disabled: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  const update = (value: number) => setQuantity(Math.max(1, value));

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-neutral-900">Quantity</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label="Kurangi quantity"
          disabled={disabled || quantity <= 1}
          onClick={() => update(quantity - 1)}
          className="inline-flex size-11 items-center justify-center rounded-lg border border-neutral-300 bg-white font-bold transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <output
          aria-label="Quantity produk"
          className="inline-flex min-w-12 items-center justify-center font-semibold"
        >
          {quantity}
        </output>
        <button
          type="button"
          aria-label="Tambah quantity"
          disabled={disabled}
          onClick={() => update(quantity + 1)}
          className="inline-flex size-11 items-center justify-center rounded-lg border border-neutral-300 bg-white font-bold transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          addItem({ productId, merchantId, quantity });
          setMessage("Produk ditambahkan ke cart.");
        }}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:bg-neutral-400 sm:w-auto"
      >
        <ShoppingCart aria-hidden="true" className="size-5" />
        {disabled ? "Produk Habis" : "Tambah ke Cart"}
      </button>
      <p aria-live="polite" className="mt-2 text-sm text-success-text">
        {message}
      </p>
    </div>
  );
}
