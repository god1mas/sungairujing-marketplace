import Link from "next/link";
import { getMerchants } from "@/services/admin-content-service";
export default async function Page() {
  const items = await getMerchants();
  return (
    <main className="px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin">← Admin</Link>
        <h1 className="mt-3 text-3xl font-bold">Merchant</h1>
        <ul className="mt-6 divide-y rounded-lg border bg-white">
          {items.map((m) => (
            <li key={m.id} className="flex justify-between gap-4 p-4">
              <span>
                <strong>{m.name}</strong>
                <br />
                <small>
                  {m.status} · {m._count.products} produk
                </small>
              </span>
              <Link
                href={`/admin/merchants/${m.id}`}
                className="font-semibold text-brand-700"
              >
                Kelola
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
