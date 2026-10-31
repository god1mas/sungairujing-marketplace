"use client";

import { useActionState } from "react";
import { BadgeCheck } from "lucide-react";
import { reviewVerificationAction } from "@/features/merchant-verification/actions";
import { initialVerificationActionState } from "@/features/merchant-verification/action-state";

export function VerificationReviewForm({
  submissionId,
}: {
  submissionId: string;
}) {
  const [state, action, pending] = useActionState(
    reviewVerificationAction.bind(null, submissionId),
    initialVerificationActionState,
  );
  return (
    <form
      action={action}
      className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3 border-b border-neutral-200 pb-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <BadgeCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-neutral-900">Keputusan verifikasi</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Setujui bukti yang valid atau berikan alasan saat menolak.
          </p>
        </div>
      </div>
      <div>
        <label
          htmlFor="rejectionReason"
          className="block font-semibold text-neutral-900"
        >
          Alasan penolakan
        </label>
        <p className="mt-1 text-sm text-neutral-600">
          Wajib diisi saat menolak. Tidak diperlukan saat menyetujui.
        </p>
        <textarea
          id="rejectionReason"
          name="rejectionReason"
          rows={4}
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-3"
          aria-describedby="rejectionReason-error"
        />
        {state.fieldErrors?.rejectionReason ? (
          <p id="rejectionReason-error" className="mt-1 text-sm text-red-700">
            {state.fieldErrors.rejectionReason[0]}
          </p>
        ) : null}
      </div>
      {state.message ? (
        <p
          role={state.success ? "status" : "alert"}
          className={
            state.success
              ? "rounded-md border border-success-border bg-success-bg px-3 py-2 text-sm text-success-text"
              : "rounded-md border border-error-border bg-error-bg px-3 py-2 text-sm text-error-text"
          }
        >
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          name="decision"
          value="APPROVE"
          disabled={pending}
          className="min-h-11 rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Setujui
        </button>
        <button
          name="decision"
          value="REJECT"
          disabled={pending}
          className="min-h-11 rounded-md border border-error-text px-4 py-2 font-semibold text-error-text hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Tolak pengajuan
        </button>
      </div>
    </form>
  );
}
