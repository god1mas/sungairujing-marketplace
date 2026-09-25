"use client";

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
        className="rounded-md border border-neutral-200 bg-white p-2"
      />
      <div>
        <p className="max-w-md break-all text-sm text-neutral-600">{qr.url}</p>
        <a
          href={qr.dataUrl}
          download={`qr-merchant-${merchantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`}
          className="mt-3 inline-flex min-h-11 items-center rounded-md border border-brand-600 px-4 font-semibold text-brand-700"
        >
          Unduh QR
        </a>
      </div>
    </div>
  );
}
