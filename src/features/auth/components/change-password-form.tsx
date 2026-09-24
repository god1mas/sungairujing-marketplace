"use client";

import { useActionState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  changePasswordAction,
  initialChangePasswordActionState,
} from "@/features/auth/actions/change-password";

export const PasswordChangeSessionInvalidator = ({
  success,
}: {
  success: boolean;
}) => {
  useEffect(() => {
    if (success) {
      void signOut({ callbackUrl: "/login?passwordChanged=1" });
    }
  }, [success]);

  return null;
};

export const ChangePasswordForm = () => {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialChangePasswordActionState,
  );

  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <PasswordChangeSessionInvalidator success={state.success} />
      {state.message && !state.success ? (
        <div
          role="alert"
          className="rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="currentPassword"
          className="font-medium text-neutral-800"
        >
          Password lama
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          aria-invalid={Boolean(error("currentPassword"))}
          aria-describedby={
            error("currentPassword") ? "currentPassword-error" : undefined
          }
          className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
        />
        {error("currentPassword") ? (
          <p
            id="currentPassword-error"
            className="mt-1 text-sm text-error-text"
          >
            {error("currentPassword")}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="newPassword" className="font-medium text-neutral-800">
          Password baru
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={pending}
          aria-invalid={Boolean(error("newPassword"))}
          aria-describedby="newPassword-help newPassword-error"
          className="mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2"
        />
        <p id="newPassword-help" className="mt-1 text-sm text-neutral-600">
          Minimal 8 karakter.
        </p>
        {error("newPassword") ? (
          <p id="newPassword-error" className="mt-1 text-sm text-error-text">
            {error("newPassword")}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-md bg-brand-700 px-4 py-3 font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Memperbarui..." : "Ubah password"}
      </button>
    </form>
  );
};
