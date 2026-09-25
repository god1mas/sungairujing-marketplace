import type { Metadata } from "next";
import Link from "next/link";
import { markNotificationReadAction } from "@/features/notifications/actions";
import { getMerchantNotifications } from "@/services/notification-service";

export const metadata: Metadata = { title: "Notifikasi" };

export default async function NotificationsPage() {
  const notifications = await getMerchantNotifications();
  const unread = notifications.filter((item) => !item.readAt).length;
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-brand-700">
          Dashboard merchant
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Notifikasi</h1>
        <p className="mt-3 text-neutral-600" aria-live="polite">
          {unread > 0
            ? `${unread} notifikasi belum dibaca.`
            : "Semua notifikasi sudah dibaca."}
        </p>
        {notifications.length === 0 ? (
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
            <p className="font-semibold">Belum ada notifikasi.</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {notifications.map((item) => (
              <li
                key={item.id}
                className={`rounded-lg border bg-white p-5 ${item.readAt ? "border-neutral-200" : "border-brand-300"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-neutral-900">{item.title}</p>
                    <p className="mt-1 leading-6 text-neutral-600">
                      {item.message}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Jakarta",
                      }).format(item.createdAt)}{" "}
                      WIB
                    </p>
                  </div>
                  {!item.readAt ? (
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800">
                      Baru
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center font-semibold text-brand-700"
                  >
                    Lihat detail
                  </Link>
                  {!item.readAt ? (
                    <form action={markNotificationReadAction}>
                      <input
                        type="hidden"
                        name="notificationId"
                        value={item.id}
                      />
                      <button
                        className="min-h-11 font-semibold text-neutral-700"
                        type="submit"
                      >
                        Tandai sudah dibaca
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
