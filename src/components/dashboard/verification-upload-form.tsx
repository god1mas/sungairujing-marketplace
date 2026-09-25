"use client";

import { useActionState } from "react";
import { submitVerificationAction } from "@/features/merchant-verification/actions";
import { initialVerificationActionState } from "@/features/merchant-verification/action-state";

export function VerificationUploadForm() {
  const [state, action, pending] = useActionState(
    submitVerificationAction,
    initialVerificationActionState,
  );
  return (
    <form
      action={action}
      className="mt-6 space-y-4 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <div>
        <label
          htmlFor="evidence"
          className="block font-semibold text-neutral-900"
        >
          Bukti usaha
        </label>
        <p id="evidence-help" className="mt-1 text-sm text-neutral-600">
          Pilih 1–3 berkas JPG, PNG, WebP, atau PDF. Maksimal 8 MB per berkas.
        </p>
        <input
          id="evidence"
          name="evidence"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          multiple
          required
          aria-describedby="evidence-help"
          className="mt-3 block w-full rounded-md border border-neutral-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700"
        />
      </div>
      {state.message ? (
        <p
          role={state.success ? "status" : "alert"}
          className={
            state.success ? "text-sm text-brand-700" : "text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-md bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Kirim pengajuan"}
      </button>
    </form>
  );
}
