import "server-only";

import { classifyPrismaError } from "@/lib/db/prisma-error-diagnostic";

type CatalogOperation =
  | "product-catalog-query"
  | "filter-options-query"
  | "catalog-result-processing";

export const logPublicCatalogFailure = (
  operation: CatalogOperation,
  error: unknown,
): void => {
  const { category, code } = classifyPrismaError(error);

  console.error(
    JSON.stringify({
      level: "error",
      event: "public-catalog-failure",
      operation,
      category,
      ...(code ? { code } : {}),
    }),
  );
};
