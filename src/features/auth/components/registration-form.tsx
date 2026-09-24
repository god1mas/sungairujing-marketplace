"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  initialRegistrationActionState,
  registerMerchantAction,
} from "@/features/auth/actions/register-merchant";

const FieldError = ({ errors, id }: { errors?: string[]; id: string }) =>
  errors?.length ? (
    <p id={id} className="mt-1 text-sm text-error-text">
      {errors[0]}
    </p>
  ) : null;

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full rounded-md bg-brand-700 px-4 py-3 font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Mendaftarkan..." : "Daftar sebagai merchant"}
    </button>
  );
};

const inputClassName =
  "mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400";

export const RegistrationForm = () => {
  const [state, formAction] = useActionState(
    registerMerchantAction,
    initialRegistrationActionState,
  );
  const error = (field: string) => state.fieldErrors?.[field];
  const describedBy = (field: string) =>
    error(field)?.length ? `${field}-error` : undefined;

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.message ? (
        <div
          role="alert"
          className="rounded-md border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="ownerName" className="font-medium text-neutral-800">
          Nama lengkap pemilik
        </label>
        <input
          id="ownerName"
          name="ownerName"
          type="text"
          autoComplete="name"
          required
          aria-invalid={Boolean(error("ownerName"))}
          aria-describedby={describedBy("ownerName")}
          className={inputClassName}
        />
        <FieldError errors={error("ownerName")} id="ownerName-error" />
      </div>

      <div>
        <label htmlFor="merchantName" className="font-medium text-neutral-800">
          Nama merchant
        </label>
        <input
          id="merchantName"
          name="merchantName"
          type="text"
          maxLength={100}
          required
          aria-invalid={Boolean(error("merchantName"))}
          aria-describedby={describedBy("merchantName")}
          className={inputClassName}
        />
        <FieldError errors={error("merchantName")} id="merchantName-error" />
      </div>

      <div>
        <label
          htmlFor="whatsappNumber"
          className="font-medium text-neutral-800"
        >
          Nomor WhatsApp
        </label>
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Contoh: 0812 3456 7890"
          required
          aria-invalid={Boolean(error("whatsappNumber"))}
          aria-describedby={describedBy("whatsappNumber")}
          className={inputClassName}
        />
        <FieldError
          errors={error("whatsappNumber")}
          id="whatsappNumber-error"
        />
      </div>

      <div>
        <label htmlFor="password" className="font-medium text-neutral-800">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          required
          aria-invalid={Boolean(error("password"))}
          aria-describedby="password-help password-error"
          className={inputClassName}
        />
        <p id="password-help" className="mt-1 text-sm text-neutral-600">
          Minimal 8 karakter.
        </p>
        <FieldError errors={error("password")} id="password-error" />
      </div>

      <div>
        <label
          htmlFor="merchantAddress"
          className="font-medium text-neutral-800"
        >
          Alamat merchant
        </label>
        <textarea
          id="merchantAddress"
          name="merchantAddress"
          rows={4}
          required
          aria-invalid={Boolean(error("merchantAddress"))}
          aria-describedby={describedBy("merchantAddress")}
          className={inputClassName}
        />
        <FieldError
          errors={error("merchantAddress")}
          id="merchantAddress-error"
        />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            required
            aria-invalid={Boolean(error("termsAccepted"))}
            aria-describedby={describedBy("termsAccepted")}
            className="mt-1 size-5 accent-brand-700"
          />
          <label htmlFor="termsAccepted" className="text-sm text-neutral-700">
            Saya menyetujui syarat dan ketentuan Sungairujing Marketplace.
          </label>
        </div>
        <FieldError errors={error("termsAccepted")} id="termsAccepted-error" />
      </div>

      <SubmitButton />
    </form>
  );
};
