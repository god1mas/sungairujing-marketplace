"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  initialMerchantProfileActionState,
  replaceMerchantLogoAction,
  updateMerchantProfileAction,
} from "@/features/merchant-profile/actions";
import {
  openingHourDays,
  type OpeningHours,
} from "@/features/merchant-profile/profile-schema";

type Profile = {
  name: string;
  slug: string;
  description: string | null;
  address: string;
  publicWhatsappNumber: string;
  loginWhatsappNumber: string;
  openingHours: OpeningHours;
  operationalStatus: "BUKA" | "TUTUP" | "LIBUR_SEMENTARA";
  verificationStatus: "BELUM_DIVERIFIKASI" | "TERVERIFIKASI" | "DITOLAK";
  logoUrl: string | null;
};

const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-md bg-brand-700 px-5 py-2 font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? "Menyimpan…" : children}
    </button>
  );
}

function Feedback({
  state,
}: {
  state: typeof initialMerchantProfileActionState;
}) {
  return state.message ? (
    <p
      role="status"
      className={`rounded-md border p-3 text-sm ${state.success ? "border-success-border bg-success-bg text-success-text" : "border-error-border bg-error-bg text-error-text"}`}
    >
      {state.message}
    </p>
  ) : null;
}

export function MerchantProfileForm({
  profile,
  readOnly = false,
}: {
  profile: Profile;
  readOnly?: boolean;
}) {
  const [state, action] = useActionState(
    updateMerchantProfileAction,
    initialMerchantProfileActionState,
  );
  const [logoState, logoAction] = useActionState(
    replaceMerchantLogoAction,
    initialMerchantProfileActionState,
  );
  const error = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <div className="mt-8 space-y-10">
      <section
        aria-labelledby="logo-heading"
        className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6"
      >
        <h2 id="logo-heading" className="text-xl font-bold">
          Logo merchant
        </h2>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative size-24 overflow-hidden rounded-lg border border-neutral-200 bg-brand-50">
            {profile.logoUrl ? (
              <Image
                src={profile.logoUrl}
                alt={`Logo ${profile.name}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <span
                aria-label="Logo belum tersedia"
                className="flex h-full items-center justify-center text-3xl font-bold text-brand-700"
              >
                {profile.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {!readOnly ? (
            <form action={logoAction} className="min-w-0 flex-1 space-y-3">
              <label htmlFor="logo" className="font-semibold text-neutral-800">
                Ganti logo
              </label>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                className={inputClass}
                aria-describedby="logo-help"
              />
              <p id="logo-help" className="text-sm text-neutral-600">
                JPG, PNG, atau WebP maksimal 3 MB. Gambar diproses menjadi WebP.
              </p>
              <Feedback state={logoState} />
              <SubmitButton>Unggah Logo</SubmitButton>
            </form>
          ) : (
            <p className="text-sm text-warning-text">
              Logo tidak dapat diubah selama akun merchant dibekukan.
            </p>
          )}
        </div>
      </section>

      <form action={action} className="space-y-8">
        <Feedback state={state} />
        {readOnly ? (
          <p
            role="status"
            className="rounded-md border border-warning-border bg-warning-bg p-3 text-sm text-warning-text"
          >
            Mode baca saja: profil publik tidak dapat diubah selama akun
            merchant dibekukan.
          </p>
        ) : null}
        <fieldset disabled={readOnly} className="space-y-8">
          <section
            aria-labelledby="identity-heading"
            className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6"
          >
            <h2 id="identity-heading" className="text-xl font-bold">
              Informasi publik
            </h2>
            <div className="mt-5 space-y-5">
              <Field label="Nama merchant" name="name" error={error("name")}>
                <input
                  id="name"
                  name="name"
                  defaultValue={profile.name}
                  required
                  maxLength={100}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Deskripsi"
                name="description"
                error={error("description")}
              >
                <textarea
                  id="description"
                  name="description"
                  defaultValue={profile.description ?? ""}
                  rows={5}
                  maxLength={2000}
                  className={inputClass}
                />
              </Field>
              <Field label="Alamat" name="address" error={error("address")}>
                <textarea
                  id="address"
                  name="address"
                  defaultValue={profile.address}
                  rows={3}
                  required
                  maxLength={1000}
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <ReadOnly
                  label="Slug publik"
                  value={profile.slug}
                  help="Tautan publik dipertahankan agar tetap stabil."
                />
                <ReadOnly
                  label="Nomor WhatsApp login"
                  value={`+${profile.loginWhatsappNumber}`}
                  help="Nomor login hanya dapat diubah melalui Super Admin."
                />
              </div>
              <ReadOnly
                label="Status verifikasi"
                value={profile.verificationStatus.replaceAll("_", " ")}
                help="Status ini dikelola melalui proses verifikasi."
              />
            </div>
          </section>

          <section
            aria-labelledby="status-heading"
            className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6"
          >
            <h2 id="status-heading" className="text-xl font-bold">
              Status operasional
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Status ini tidak mengubah verifikasi atau moderasi merchant.
            </p>
            <select
              id="operationalStatus"
              name="operationalStatus"
              defaultValue={profile.operationalStatus}
              className={`${inputClass} sm:max-w-sm`}
              aria-invalid={Boolean(error("operationalStatus"))}
            >
              <option value="BUKA">Buka</option>
              <option value="TUTUP">Tutup</option>
              <option value="LIBUR_SEMENTARA">Libur sementara</option>
            </select>
            {error("operationalStatus") ? (
              <p className="mt-1 text-sm text-error-text">
                {error("operationalStatus")}
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="hours-heading"
            className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6"
          >
            <h2 id="hours-heading" className="text-xl font-bold">
              Jam operasional
            </h2>
            {error("openingHours") ? (
              <p role="alert" className="mt-2 text-sm text-error-text">
                {error("openingHours")}
              </p>
            ) : null}
            <div className="mt-5 space-y-4">
              {openingHourDays.map(([day, label]) => {
                const hours = profile.openingHours[day];
                return (
                  <fieldset
                    key={day}
                    className="grid gap-3 rounded-md border border-neutral-200 p-4 sm:grid-cols-[8rem_1fr_1fr_auto] sm:items-end"
                  >
                    <legend className="px-1 font-semibold">{label}</legend>
                    <label className="text-sm">
                      Buka
                      <input
                        type="time"
                        name={`${day}.open`}
                        defaultValue={"open" in hours ? hours.open : ""}
                        className={inputClass}
                      />
                    </label>
                    <label className="text-sm">
                      Tutup
                      <input
                        type="time"
                        name={`${day}.close`}
                        defaultValue={"close" in hours ? hours.close : ""}
                        className={inputClass}
                      />
                    </label>
                    <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        name={`${day}.closed`}
                        defaultChecked={hours.closed}
                      />{" "}
                      Tutup
                    </label>
                  </fieldset>
                );
              })}
            </div>
          </section>
          <SubmitButton>Simpan Profil</SubmitButton>
        </fieldset>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="font-semibold text-neutral-800">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-sm text-error-text">{error}</p> : null}
    </div>
  );
}

function ReadOnly({
  label,
  value,
  help,
}: {
  label: string;
  value: string;
  help: string;
}) {
  return (
    <div>
      <p className="font-semibold text-neutral-800">{label}</p>
      <output className="mt-2 block min-h-11 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-700">
        {value}
      </output>
      <p className="mt-1 text-sm text-neutral-600">{help}</p>
    </div>
  );
}
