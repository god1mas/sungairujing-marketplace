"use client";

import { useActionState } from "react";
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
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5"
    >
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
          className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2"
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
            state.success ? "text-sm text-brand-700" : "text-sm text-red-700"
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
          className="min-h-11 rounded-md bg-brand-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          Setujui
        </button>
        <button
          name="decision"
          value="REJECT"
          disabled={pending}
          className="min-h-11 rounded-md border border-red-700 px-4 py-2 font-semibold text-red-700 disabled:opacity-60"
        >
          Tolak pengajuan
        </button>
      </div>
    </form>
  );
}
