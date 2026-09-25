import Link from "next/link";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import {
  ANALYTICS_PERIODS,
  getMerchantAnalytics,
  type AnalyticsPeriod,
} from "@/services/analytics-service";

const labels: Record<AnalyticsPeriod, string> = {
  TODAY: "Hari ini",
  LAST_7_DAYS: "7 hari",
  LAST_30_DAYS: "30 hari",
  ALL_TIME: "Semua waktu",
};
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const requested = (await searchParams).period;
  const period = ANALYTICS_PERIODS.includes(requested as AnalyticsPeriod)
    ? (requested as AnalyticsPeriod)
    : "LAST_7_DAYS";
  const analytics = await getMerchantAnalytics(period);
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-brand-700">
          Interaksi marketplace
        </p>
        <h1 className="mt-1 text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-neutral-600">
          Mengukur kunjungan detail produk dan tindakan membuka WhatsApp, bukan
          pesanan atau penjualan.
        </p>
        <nav
          aria-label="Periode analytics"
          className="mt-6 flex flex-wrap gap-2"
        >
          {ANALYTICS_PERIODS.map((item) => (
            <Link
              key={item}
              href={`/dashboard/analytics?period=${item}`}
              aria-current={item === period ? "page" : undefined}
              className={`min-h-11 rounded-md border px-4 py-2 font-semibold ${item === period ? "border-brand-700 bg-brand-50 text-brand-800" : "border-neutral-300 bg-white text-neutral-700"}`}
            >
              {labels[item]}
            </Link>
          ))}
        </nav>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <dt className="text-sm font-semibold text-neutral-600">
              Product Views
            </dt>
            <dd className="mt-2 text-3xl font-bold text-neutral-900">
              {analytics.productViews}
            </dd>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <dt className="text-sm font-semibold text-neutral-600">
              Klik WhatsApp
            </dt>
            <dd className="mt-2 text-3xl font-bold text-neutral-900">
              {analytics.whatsappClicks}
            </dd>
          </div>
        </dl>
        <section
          aria-labelledby="chart-title"
          className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 sm:p-6"
        >
          <h2 id="chart-title" className="text-xl font-bold">
            Tren interaksi
          </h2>
          <p className="mb-5 mt-1 text-sm text-neutral-600">
            Ringkasan harian dalam zona waktu Asia/Jakarta.
          </p>
          <AnalyticsChart data={analytics.chart} />
        </section>
      </div>
    </main>
  );
}
