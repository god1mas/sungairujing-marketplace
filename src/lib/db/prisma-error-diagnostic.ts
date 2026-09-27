import { Prisma } from "@prisma/client";
import { logAuthDiagnostic } from "@/lib/auth/auth-diagnostic";

export type PrismaErrorCategory =
  | "prisma-known-request-error"
  | "prisma-unknown-request-error"
  | "prisma-initialization-error"
  | "prisma-validation-error"
  | "prisma-rust-panic-error"
  | "non-prisma-error";

export type SafePrismaCode = `P${number}${number}${number}${number}`;

export type PrismaErrorDiagnostic = {
  category: PrismaErrorCategory;
  code?: SafePrismaCode;
};

const safePrismaCode = (code: string): SafePrismaCode | undefined =>
  /^P\d{4}$/.test(code) ? (code as SafePrismaCode) : undefined;

export const classifyPrismaError = (error: unknown): PrismaErrorDiagnostic => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      category: "prisma-known-request-error",
      code: safePrismaCode(error.code),
    };
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return { category: "prisma-unknown-request-error" };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { category: "prisma-initialization-error" };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { category: "prisma-validation-error" };
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return { category: "prisma-rust-panic-error" };
  }

  return { category: "non-prisma-error" };
};

export type PrismaDiagnosticScope = "user-lookup" | "registration-persistence";

export const logPrismaErrorDiagnostic = (
  scope: PrismaDiagnosticScope,
  error: unknown,
): void => {
  const diagnostic = classifyPrismaError(error);
  logAuthDiagnostic(`${scope}-error-class:${diagnostic.category}`);

  if (diagnostic.code) {
    logAuthDiagnostic(`${scope}-prisma-code:${diagnostic.code}`);
  }
};
