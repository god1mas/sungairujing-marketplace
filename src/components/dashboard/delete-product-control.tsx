"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/features/products/actions";
import { initialProductActionState } from "@/features/products/action-state";

function DeleteButton({ name }: { name: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-md bg-error-text px-4 py-2 font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Menghapus…" : `Ya, hapus ${name}`}
    </button>
  );
}

export function DeleteProductControl({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(
    deleteProductAction,
    initialProductActionState,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 px-3 font-semibold text-error-text"
        aria-label={`Hapus permanen ${productName}`}
      >
        Hapus
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-modal="false"
      aria-labelledby={`delete-${productId}-title`}
      aria-describedby={`delete-${productId}-description`}
      className="mt-3 rounded-md border border-error-border bg-error-bg p-4"
    >
      <h3
        id={`delete-${productId}-title`}
        className="font-bold text-error-text"
      >
        Hapus produk secara permanen?
      </h3>
      <p
        id={`delete-${productId}-description`}
        className="mt-1 text-sm text-error-text"
      >
        Produk “{productName}” dan data terkait akan dihapus. Tindakan ini tidak
        dapat dibatalkan.
      </p>
      {state.message ? (
        <p role="status" className="mt-2 text-sm text-error-text">
          {state.message}
        </p>
      ) : null}
      <form action={action} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="confirmation" value="DELETE" />
        <DeleteButton name={productName} />
        <button
          type="button"
          autoFocus
          onClick={() => setOpen(false)}
          className="min-h-11 rounded-md border border-neutral-300 bg-white px-4 py-2 font-semibold"
        >
          Batal
        </button>
      </form>
    </div>
  );
}
