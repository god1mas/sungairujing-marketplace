import "server-only";

import { createHash, randomUUID } from "node:crypto";

export const VISITOR_COOKIE_NAME = "srm_visitor";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const createVisitorId = () => randomUUID();

export const isVisitorId = (value: string | undefined): value is string =>
  Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    ),
  );

export const hashVisitorId = (
  visitorId: string,
  pepper = process.env.VISITOR_HASH_PEPPER,
) => {
  if (!pepper) throw new Error("Visitor analytics is not configured.");
  return createHash("sha256").update(`${pepper}${visitorId}`).digest("hex");
};
