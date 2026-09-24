"use client";

import { useState } from "react";
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
          className="size-11 rounded-md border border-neutral-300 bg-white font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
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
          className="size-11 rounded-md border border-neutral-300 bg-white font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          addItem({ productId, merchantId, quantity });
          setMessage("Produk ditambahkan ke cart.");
        }}
        className="mt-4 min-h-11 w-full rounded-md bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-neutral-400 sm:w-auto"
      >
        {disabled ? "Produk Habis" : "Tambah ke Cart"}
      </button>
      <p aria-live="polite" className="mt-2 text-sm text-success-text">
        {message}
      </p>
    </div>
  );
}
