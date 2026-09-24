export function SuspensionBanner({ reason }: { reason: string | null }) {
  return (
    <section
      role="status"
      aria-labelledby="merchant-suspension-title"
      className="border-b border-error-border bg-error-bg px-4 py-4 text-error-text sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="merchant-suspension-title" className="font-bold">
          Akun merchant sedang dibekukan
        </h2>
        <p className="mt-1 text-sm">
          Anda masih dapat melihat dashboard dan mengelola keamanan akun, tetapi
          tidak dapat mengubah konten publik.
        </p>
        {reason ? (
          <p className="mt-2 text-sm">
            <span className="font-semibold">Alasan:</span> {reason}
          </p>
        ) : null}
        <p className="mt-2 text-sm">
          Reaktivasi hanya dapat dilakukan oleh Super Admin.
        </p>
      </div>
    </section>
  );
}
