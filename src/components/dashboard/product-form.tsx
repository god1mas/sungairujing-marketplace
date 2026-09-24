"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createProductAction,
  initialProductActionState,
  updateProductAction,
} from "@/features/products/actions";

type Category = { id: string; name: string };
type EditableProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  unit: string;
  availabilityStatus: "TERSEDIA" | "HABIS";
  moderationStatus: "ACTIVE" | "SUSPENDED";
  suspensionReason: string | null;
};

const fieldClass =
  "mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-md bg-brand-700 px-5 py-2 font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Buat Produk"}
    </button>
  );
}

export function ProductForm({
  categories,
  product,
  readOnly = false,
}: {
  categories: Category[];
  product?: EditableProduct;
  readOnly?: boolean;
}) {
  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction;
  const [state, formAction] = useActionState(action, initialProductActionState);
  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.message ? (
        <p
          role="status"
          className={`rounded-md border p-3 text-sm ${
            state.success
              ? "border-success-border bg-success-bg text-success-text"
              : "border-error-border bg-error-bg text-error-text"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {readOnly ? (
        <p
          role="status"
          className="rounded-md border border-warning-border bg-warning-bg p-3 text-sm text-warning-text"
        >
          Mode baca saja: produk tidak dapat diubah selama akun merchant
          dibekukan.
        </p>
      ) : null}

      <fieldset disabled={readOnly} className="space-y-5">
        {product?.moderationStatus === "SUSPENDED" ? (
          <div className="rounded-md border border-warning-border bg-warning-bg p-4 text-warning-text">
            <p className="font-semibold">Produk dibekukan oleh Super Admin.</p>
            {product.suspensionReason ? (
              <p className="mt-1 text-sm">Alasan: {product.suspensionReason}</p>
            ) : null}
            <p className="mt-1 text-sm">
              Perubahan ini tidak akan mengaktifkan kembali produk.
            </p>
          </div>
        ) : null}

        <Field label="Nama produk" name="name" error={error("name")}>
          <input
            id="name"
            name="name"
            defaultValue={product?.name}
            maxLength={120}
            required
            aria-invalid={Boolean(error("name"))}
            aria-describedby={error("name") ? "name-error" : undefined}
            className={fieldClass}
          />
        </Field>
        <Field
          label="Deskripsi"
          name="description"
          error={error("description")}
        >
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            maxLength={3000}
            rows={7}
            required
            aria-invalid={Boolean(error("description"))}
            aria-describedby={
              error("description") ? "description-error" : undefined
            }
            className={fieldClass}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Harga" name="price" error={error("price")}>
            <input
              id="price"
              name="price"
              defaultValue={product?.price}
              inputMode="decimal"
              placeholder="Contoh: 15000"
              required
              aria-invalid={Boolean(error("price"))}
              aria-describedby={error("price") ? "price-error" : undefined}
              className={fieldClass}
            />
          </Field>
          <Field label="Satuan" name="unit" error={error("unit")}>
            <input
              id="unit"
              name="unit"
              defaultValue={product?.unit}
              maxLength={50}
              placeholder="Contoh: bungkus"
              required
              aria-invalid={Boolean(error("unit"))}
              aria-describedby={error("unit") ? "unit-error" : undefined}
              className={fieldClass}
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Kategori" name="categoryId" error={error("categoryId")}>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? ""}
              required
              aria-invalid={Boolean(error("categoryId"))}
              aria-describedby={
                error("categoryId") ? "categoryId-error" : undefined
              }
              className={fieldClass}
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Status ketersediaan"
            name="availabilityStatus"
            error={error("availabilityStatus")}
          >
            <select
              id="availabilityStatus"
              name="availabilityStatus"
              defaultValue={product?.availabilityStatus ?? "TERSEDIA"}
              required
              aria-invalid={Boolean(error("availabilityStatus"))}
              aria-describedby={
                error("availabilityStatus")
                  ? "availabilityStatus-error"
                  : undefined
              }
              className={fieldClass}
            >
              <option value="TERSEDIA">Tersedia</option>
              <option value="HABIS">Habis</option>
            </select>
          </Field>
        </div>

        <p className="text-sm text-neutral-600">
          Informasi varian seperti ukuran atau rasa dapat ditulis pada
          deskripsi.
        </p>
        {!product ? (
          <Field label="Foto produk (opsional)" name="images">
            <input
              id="images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className={fieldClass}
              aria-describedby="images-help"
            />
            <p id="images-help" className="mt-1 text-sm text-neutral-600">
              Maksimal 5 foto, masing-masing 5 MB. Format JPG, PNG, atau WebP.
              Foto pertama menjadi cover.
            </p>
          </Field>
        ) : null}
        <SubmitButton editing={Boolean(product)} />
      </fieldset>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="font-semibold text-neutral-800">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm text-error-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}
