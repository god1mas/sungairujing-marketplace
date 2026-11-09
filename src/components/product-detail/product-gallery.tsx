"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
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
      <div className="relative aspect-square overflow-hidden rounded-xl border border-brand-100 bg-cream-50 shadow-sm">
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
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-500">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
              <ImageOff aria-hidden="true" className="size-6" />
            </span>
            <span>Foto {name} belum tersedia</span>
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
              className={`relative aspect-square min-h-11 w-20 shrink-0 overflow-hidden rounded-lg border bg-neutral-100 transition sm:w-24 ${
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
