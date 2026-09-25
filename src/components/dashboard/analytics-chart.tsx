"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AnalyticsChart({
  data,
}: {
  data: Array<{ date: string; productViews: number; whatsappClicks: number }>;
}) {
  if (data.length === 0)
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-center text-neutral-600">
        Belum ada interaksi pada periode ini.
      </div>
    );
  return (
    <div
      className="h-72 w-full min-w-0"
      role="img"
      aria-label="Grafik Product Views dan Klik WhatsApp per tanggal"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="productViews"
            name="Product Views"
            stroke="#15803d"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="whatsappClicks"
            name="Klik WhatsApp"
            stroke="#a16207"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
