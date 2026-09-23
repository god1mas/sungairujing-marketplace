export default function Home() {
  return (
    <main className="flex min-h-screen items-center px-4 py-12 sm:px-6 lg:px-8">
      <section
        aria-labelledby="page-title"
        className="mx-auto w-full max-w-2xl"
      >
        <p className="text-sm font-semibold tracking-wide text-brand-700">
          Marketplace lokal UMKM Desa Sungairujing
        </p>
        <h1
          id="page-title"
          className="mt-3 text-3xl leading-10 font-bold tracking-tight text-neutral-900 sm:text-4xl sm:leading-12"
        >
          Sungairujing Marketplace
        </h1>
        <p className="mt-4 max-w-xl text-base leading-6 text-neutral-700 sm:text-lg sm:leading-7">
          Foundation aplikasi sedang disiapkan untuk menghadirkan etalase
          digital yang jelas, ringan, dan mudah digunakan.
        </p>
        <div className="mt-8 border-l-2 border-brand-600 pl-4">
          <p className="text-sm font-medium text-neutral-800">
            Status development
          </p>
          <p className="mt-1 text-sm leading-5 text-neutral-600">
            Phase 0 — Repository &amp; Application Foundation
          </p>
        </div>
      </section>
    </main>
  );
}
