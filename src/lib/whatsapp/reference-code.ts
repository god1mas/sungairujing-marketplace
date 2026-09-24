import "server-only";

import { randomBytes } from "node:crypto";

const ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomSuffix = () => {
  const bytes = randomBytes(4);
  return [...bytes]
    .map((byte) => ALPHANUMERIC[byte % ALPHANUMERIC.length])
    .join("");
};

export const generateReferenceCode = (
  date: Date = new Date(),
  suffix: () => string = randomSuffix,
) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  const code = suffix().toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(code)) throw new Error("Invalid reference suffix");
  return `SRM-${value("year")}${value("month")}${value("day")}-${code}`;
};
