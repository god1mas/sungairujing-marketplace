const CANONICAL_WHATSAPP_PATTERN = /^62\d{8,15}$/;
const REMOVABLE_SEPARATORS = /[\s().-]/g;

export class InvalidWhatsAppNumberError extends Error {
  constructor() {
    super("Nomor WhatsApp tidak valid.");
    this.name = "InvalidWhatsAppNumberError";
  }
}

export const normalizeWhatsAppNumber = (input: string): string => {
  const compact = input.trim().replace(REMOVABLE_SEPARATORS, "");
  const canonical = compact.startsWith("+")
    ? compact.slice(1)
    : compact.startsWith("0")
      ? `62${compact.slice(1)}`
      : compact;

  if (!CANONICAL_WHATSAPP_PATTERN.test(canonical)) {
    throw new InvalidWhatsAppNumberError();
  }

  return canonical;
};
