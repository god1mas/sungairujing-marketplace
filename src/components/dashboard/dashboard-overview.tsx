import type { MerchantDashboardProductCounts } from "@/repositories/merchant-dashboard-repository";

const metricDefinitions = [
  {
    key: "totalProducts",
    label: "Total Produk",
    description: "Semua produk milik merchant, termasuk yang dibekukan.",
  },
  {
    key: "availableProducts",
    label: "Produk Tersedia",
    description: "Produk dengan status ketersediaan Tersedia.",
  },
  {
    key: "suspendedProducts",
    label: "Produk Dibekukan",
    description: "Produk yang dibekukan melalui moderasi.",
  },
] as const;

export function DashboardOverview({
  metrics,
}: {
  metrics: MerchantDashboardProductCounts;
}) {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-brand-700">Overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
          Dashboard Merchant
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Ringkasan faktual produk yang terdaftar untuk merchant Anda.
        </p>

        <section aria-labelledby="product-summary" className="mt-8">
          <h2 id="product-summary" className="text-xl font-bold">
            Ringkasan Produk
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metricDefinitions.map((metric) => (
              <div
                key={metric.key}
                className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <dt className="font-semibold text-neutral-700">
                  {metric.label}
                </dt>
                <dd className="mt-2 text-3xl font-bold text-neutral-900">
                  {metrics[metric.key]}
                </dd>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {metric.description}
                </p>
              </div>
            ))}
          </dl>
        </section>

        {metrics.totalProducts === 0 ? (
          <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-bold">Belum ada produk</h2>
            <p className="mt-2 text-neutral-600">
              Produk belum ditambahkan. Pengelolaan produk akan tersedia pada
              tahap berikutnya.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
