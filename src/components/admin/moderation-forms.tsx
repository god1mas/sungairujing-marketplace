"use client";
import { useActionState } from "react";
import {
  initialModerationState,
  moderationAction,
  reportStatusAction,
} from "@/features/moderation/actions";

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
      className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <h2 className="font-bold">Status laporan</h2>
      <label className="block">
        Catatan penyelesaian
        <textarea
          name="resolutionNote"
          maxLength={1500}
          rows={3}
          className="mt-1 block w-full rounded-md border border-neutral-300 p-2"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, label]) => (
          <button
            key={value}
            name="status"
            value={value}
            disabled={pending}
            className="min-h-11 rounded-md border border-brand-700 px-4 font-semibold text-brand-700"
          >
            {label}
          </button>
        ))}
      </div>
      {state.message ? (
        <p role={state.success ? "status" : "alert"}>{state.message}</p>
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
      className="space-y-3 rounded-lg border border-warning-border bg-warning-bg p-5"
    >
      <h2 className="font-bold">{label}</h2>
      <label className="block font-semibold">
        Alasan tindakan
        <textarea
          name="reason"
          required
          minLength={5}
          maxLength={1500}
          rows={3}
          className="mt-1 block w-full rounded-md border border-neutral-300 bg-white p-2"
        />
      </label>
      <button
        disabled={pending}
        className="min-h-11 rounded-md bg-error-text px-4 font-semibold text-white disabled:opacity-60"
      >
        Konfirmasi {label.toLowerCase()}
      </button>
      {state.message ? (
        <p role={state.success ? "status" : "alert"}>{state.message}</p>
      ) : null}
    </form>
  );
}
