"use client";

import { useActionState } from "react";
import {
  initialReportState,
  submitReportAction,
} from "@/features/reports/actions";

const reasons = [
  ["ILLEGAL_OR_PROHIBITED", "Barang ilegal atau dilarang"],
  ["DANGEROUS_PRODUCT", "Produk berbahaya"],
  ["FRAUD_OR_MISLEADING", "Informasi menyesatkan"],
  ["PHOTO_DESCRIPTION_MISMATCH", "Foto dan deskripsi tidak sesuai"],
  ["SPAM", "Spam"],
  ["OTHER", "Lainnya"],
] as const;

export function ReportForm({
  targetType,
  targetSlug,
}: {
  targetType: "PRODUCT" | "MERCHANT";
  targetSlug: string;
}) {
  const [state, action, pending] = useActionState(
    submitReportAction.bind(null, targetType, targetSlug),
    initialReportState,
  );
  return (
    <details className="mt-8 rounded-lg border border-neutral-200 bg-white p-5">
      <summary className="min-h-11 cursor-pointer font-semibold text-neutral-800">
        Laporkan {targetType === "PRODUCT" ? "produk" : "merchant"}
      </summary>
      <p className="mt-2 text-sm text-neutral-600">
        Laporan adalah informasi untuk ditinjau Super Admin dan tidak otomatis
        membekukan target.
      </p>
      <form action={action} className="mt-4 space-y-4">
        <label className="block font-semibold">
          Alasan
          <select
            name="reason"
            required
            className="mt-1 block min-h-11 w-full rounded-md border border-neutral-300 px-3"
          >
            <option value="">Pilih alasan</option>
            {reasons.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {state.fieldErrors?.reason ? (
          <p role="alert" className="text-sm text-error-text">
            {state.fieldErrors.reason[0]}
          </p>
        ) : null}
        <label className="block font-semibold">
          Detail
          <textarea
            name="details"
            rows={4}
            maxLength={1500}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        {state.fieldErrors?.details ? (
          <p role="alert" className="text-sm text-error-text">
            {state.fieldErrors.details[0]}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block font-semibold">
            Nama pelapor{" "}
            <span className="font-normal text-neutral-500">(opsional)</span>
            <input
              name="reporterName"
              maxLength={100}
              className="mt-1 block min-h-11 w-full rounded-md border border-neutral-300 px-3"
            />
          </label>
          <label className="block font-semibold">
            WhatsApp pelapor{" "}
            <span className="font-normal text-neutral-500">(opsional)</span>
            <input
              name="reporterWhatsapp"
              inputMode="tel"
              className="mt-1 block min-h-11 w-full rounded-md border border-neutral-300 px-3"
            />
          </label>
        </div>
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        {state.message ? (
          <p
            role={state.success ? "status" : "alert"}
            className={
              state.success
                ? "text-sm text-success-text"
                : "text-sm text-error-text"
            }
          >
            {state.message}
          </p>
        ) : null}
        <button
          disabled={pending || state.success}
          className="min-h-11 rounded-md border border-error-border px-4 font-semibold text-error-text disabled:opacity-60"
        >
          {pending ? "Mengirim…" : "Kirim laporan"}
        </button>
      </form>
    </details>
  );
}
