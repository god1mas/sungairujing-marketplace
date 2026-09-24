import "server-only";

import { formatRupiah } from "@/lib/format/currency";
import type { ValidatedCheckoutBuyer } from "@/features/checkout/checkout-schema";

export type CheckoutMessageItem = {
  name: string;
  quantity: number;
  subtotal: string;
};

export const buildCheckoutMessage = ({
  merchantName,
  items,
  total,
  buyer,
  referenceCode,
}: {
  merchantName: string;
  items: CheckoutMessageItem[];
  total: string;
  buyer: ValidatedCheckoutBuyer;
  referenceCode: string;
}) => {
  const fulfillment =
    buyer.fulfillmentMethod === "DIANTAR" ? "Diantar" : "Ambil sendiri";
  const lines = [
    `Halo ${merchantName}, saya ingin menanyakan pesanan`,
    "dari Sungairujing Marketplace.",
    "",
    ...items.map(
      (item) =>
        `${item.quantity}x ${item.name} — ${formatRupiah(item.subtotal)}`,
    ),
    "",
    `Total estimasi: ${formatRupiah(total)}`,
    "",
    `Nama: ${buyer.name}`,
    `No. WhatsApp: ${buyer.whatsappNumber}`,
    `Metode: ${fulfillment}`,
  ];
  if (buyer.fulfillmentMethod === "DIANTAR")
    lines.push(`Alamat: ${buyer.address}`);
  if (buyer.note) lines.push(`Catatan: ${buyer.note}`);
  lines.push(
    `Kode: ${referenceCode}`,
    "",
    "Mohon konfirmasi ketersediaan dan total pembayarannya.",
  );
  return lines.join("\n");
};

export const buildWhatsAppUrl = (number: string, message: string) => {
  if (!/^62\d{8,15}$/.test(number)) throw new Error("Invalid merchant contact");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
