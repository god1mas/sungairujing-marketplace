import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Cart produk lokal Sungairujing, dikelompokkan per merchant.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <main id="main-content" className="bg-neutral-50">
      <div className="mx-auto max-w-(--container-app) px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Cart</h1>
        <p className="mt-2 text-neutral-600">
          Checkout dilakukan per merchant.
        </p>
        <CartPageClient />
      </div>
    </main>
  );
}
