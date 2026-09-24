import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout via WhatsApp",
  description:
    "Validasi produk dan lanjutkan komunikasi dengan merchant melalui WhatsApp.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ merchant: string }>;
}) {
  const { merchant } = await params;
  return (
    <main id="main-content" className="bg-neutral-50">
      <div className="mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Checkout via WhatsApp
        </h1>
        <p className="mt-2 text-neutral-600">
          Data checkout tidak disimpan sebagai order di marketplace.
        </p>
        <CheckoutForm merchantSlug={merchant} />
      </div>
    </main>
  );
}
