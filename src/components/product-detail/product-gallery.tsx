"use client";

import Image from "next/image";
import { useState } from "react";
import type { PublicProductDetail } from "@/services/public-product-detail-service";

export function ProductGallery({
  name,
  images,
}: Pick<PublicProductDetail, "name" | "images">) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = images[selectedIndex];

  return (
    <section aria-label={`Galeri foto ${name}`}>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-neutral-500">
            Foto {name} belum tersedia
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image.url}-${index}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Tampilkan gambar ${index + 1} dari ${name}`}
              aria-pressed={selectedIndex === index}
              className={`relative aspect-square min-h-11 w-20 shrink-0 overflow-hidden rounded-md border bg-neutral-100 sm:w-24 ${
                selectedIndex === index
                  ? "border-brand-600 ring-2 ring-brand-200"
                  : "border-neutral-200"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
