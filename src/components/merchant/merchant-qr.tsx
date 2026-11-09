"use client";

import { Download } from "lucide-react";

export function MerchantQr({
  merchantName,
  qr,
}: {
  merchantName: string;
  qr: { url: string; dataUrl: string } | null;
}) {
  if (!qr) {
    return (
      <p className="mt-3 text-sm text-neutral-600">
        QR tersedia setelah alamat aplikasi dikonfigurasi.
      </p>
    );
  }
  return (
    <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      {/* Generated locally and contains only the canonical public merchant URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qr.dataUrl}
        alt={`QR halaman publik ${merchantName}`}
        width={160}
        height={160}
        className="rounded-lg border border-yellow-200 bg-white p-2 shadow-sm"
      />
      <div>
        <p className="max-w-md break-all text-sm text-neutral-600">{qr.url}</p>
        <a
          href={qr.dataUrl}
          download={`qr-merchant-${merchantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-600 bg-white px-4 font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Download aria-hidden="true" className="size-4" />
          Unduh QR
        </a>
      </div>
    </div>
  );
}
