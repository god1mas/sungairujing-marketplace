"use client";
import { AlertTriangle, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useActionState } from "react";
import {
  moderationAction,
  reportStatusAction,
} from "@/features/moderation/actions";
import { initialModerationState } from "@/features/moderation/action-state";

export function ReportStatusForm({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}) {
  const [state, action, pending] = useActionState(
    reportStatusAction.bind(null, reportId),
    initialModerationState,
  );
  const options =
    status === "BARU"
      ? [["DITINJAU", "Mulai ditinjau"]]
      : status === "DITINJAU"
        ? [
            ["SELESAI", "Selesaikan"],
            ["DITOLAK", "Tolak laporan"],
          ]
        : [];
  if (!options.length) return null;
  return (
    <form
      action={action}
      className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-info-bg text-info-text">
          <ClipboardCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-neutral-900">Status laporan</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Perbarui progres peninjauan tanpa mengubah target secara otomatis.
          </p>
        </div>
      </div>
      <label className="block font-semibold text-neutral-800">
        Catatan penyelesaian
        <textarea
          name="resolutionNote"
          maxLength={1500}
          rows={3}
          className="mt-2 block w-full rounded-md border border-neutral-300 p-3 font-normal"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, label]) => (
          <button
            key={value}
            name="status"
            value={value}
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-brand-300 px-4 font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {label}
          </button>
        ))}
      </div>
      {state.message ? (
        <p
          role={state.success ? "status" : "alert"}
          className={`rounded-md border px-3 py-2 text-sm ${
            state.success
              ? "border-success-border bg-success-bg text-success-text"
              : "border-error-border bg-error-bg text-error-text"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
export function TargetModerationForm({
  reportId,
  actionType,
  targetId,
  label,
}: {
  reportId: string;
  actionType: "SUSPEND_PRODUCT" | "SUSPEND_MERCHANT" | "REACTIVATE_MERCHANT";
  targetId: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(
    moderationAction.bind(null, reportId, actionType, targetId),
    initialModerationState,
  );
  return (
    <form
      action={action}
      className="space-y-5 rounded-lg border border-warning-border bg-warning-bg p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-warning-text"
        />
        <div>
          <h2 className="font-bold text-neutral-900">{label}</h2>
          <p className="mt-1 text-sm text-neutral-700">
            Tindakan moderasi harus disertai alasan yang jelas.
          </p>
        </div>
      </div>
      <label className="block font-semibold">
        Alasan tindakan
        <textarea
          name="reason"
          required
          minLength={5}
          maxLength={1500}
          rows={3}
          className="mt-2 block w-full rounded-md border border-neutral-300 bg-white p-3 font-normal"
        />
      </label>
      <button
        disabled={pending}
        className="min-h-11 rounded-md bg-error-text px-4 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Konfirmasi {label.toLowerCase()}
      </button>
      {state.message ? (
        <p
          role={state.success ? "status" : "alert"}
          className="rounded-md border border-error-border bg-white px-3 py-2 text-sm text-error-text"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
