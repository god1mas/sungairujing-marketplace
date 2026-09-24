"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  changeProductCoverAction,
  initialProductActionState,
  removeProductImageAction,
  uploadProductImagesAction,
} from "@/features/products/actions";

type ProductImage = {
  id: string;
  url: string | null;
  alt: string;
  isCover: boolean;
  sortOrder: number;
};

function ActionButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
    >
      {pending ? "Memproses…" : children}
    </button>
  );
}

function Feedback({ state }: { state: typeof initialProductActionState }) {
  return state.message ? (
    <p
      role="status"
      className={`mt-3 rounded-md border p-3 text-sm ${
        state.success
          ? "border-success-border bg-success-bg text-success-text"
          : "border-error-border bg-error-bg text-error-text"
      }`}
    >
      {state.message}
    </p>
  ) : null;
}

export function ProductImageManager({
  productId,
  images,
  readOnly = false,
}: {
  productId: string;
  images: ProductImage[];
  readOnly?: boolean;
}) {
  const [uploadState, uploadAction] = useActionState(
    uploadProductImagesAction.bind(null, productId),
    initialProductActionState,
  );
  const remaining = 5 - images.length;

  return (
    <section
      aria-labelledby="product-images-title"
      className="mt-10 border-t border-neutral-200 pt-8"
    >
      <h2 id="product-images-title" className="text-2xl font-bold">
        Foto Produk
      </h2>
      <p className="mt-2 text-sm text-neutral-600">
        {images.length} dari 5 foto. Foto diproses menjadi WebP; format input
        JPG, PNG, atau WebP maksimal 5 MB.
      </p>

      {images.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="rounded-lg border border-neutral-200 p-3"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-100">
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    Pratinjau tidak tersedia
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold">
                Foto {index + 1}
                {image.isCover ? " — Cover" : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!readOnly && !image.isCover ? (
                  <ImageActionForm
                    action={changeProductCoverAction}
                    productId={productId}
                    imageId={image.id}
                    label={`Jadikan foto ${index + 1} sebagai cover`}
                  />
                ) : null}
                {!readOnly ? (
                  <ImageActionForm
                    action={removeProductImageAction}
                    productId={productId}
                    imageId={image.id}
                    label={`Hapus foto ${index + 1}`}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-md bg-neutral-50 p-4 text-sm text-neutral-600">
          Produk belum memiliki foto.
        </p>
      )}

      {!readOnly && remaining > 0 ? (
        <form action={uploadAction} className="mt-6">
          <label
            htmlFor="additional-images"
            className="font-semibold text-neutral-800"
          >
            Tambah foto
          </label>
          <input
            id="additional-images"
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
            aria-describedby="additional-images-help"
          />
          <p
            id="additional-images-help"
            className="mt-1 text-sm text-neutral-600"
          >
            Anda dapat menambah hingga {remaining} foto lagi.
          </p>
          <div className="mt-3">
            <ActionButton>Unggah Foto</ActionButton>
          </div>
          <Feedback state={uploadState} />
        </form>
      ) : null}
    </section>
  );
}

function ImageActionForm({
  action,
  productId,
  imageId,
  label,
}: {
  action: typeof changeProductCoverAction;
  productId: string;
  imageId: string;
  label: string;
}) {
  const [state, formAction] = useActionState(action, initialProductActionState);
  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="imageId" value={imageId} />
      <ActionButton>{label}</ActionButton>
      <Feedback state={state} />
    </form>
  );
}
