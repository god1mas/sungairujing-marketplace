const AUTH_DIAGNOSTIC_PREFIX = "[auth-diagnostic]";

export type AuthDiagnosticStage =
  | "input-validation-pass"
  | "input-validation-fail"
  | "rate-limit-key-start"
  | "rate-limit-key-pass"
  | "rate-limit-key-exception"
  | "rate-limiter-init-start"
  | "rate-limiter-init-pass"
  | "rate-limiter-init-exception"
  | "rate-limit-check-start"
  | "rate-limit-pass"
  | "rate-limit-blocked"
  | "rate-limit-exception"
  | "normalization-pass"
  | "normalization-fail"
  | "user-found"
  | "user-not-found"
  | "user-active"
  | "user-inactive"
  | "user-lookup-exception"
  | "password-verify-pass"
  | "password-verify-false"
  | "password-verify-exception"
  | "authorize-success"
  | "registration-validation-pass"
  | "registration-validation-fail"
  | "registration-password-hash-start"
  | "registration-password-hash-pass"
  | "registration-password-hash-exception"
  | "registration-persistence-start"
  | "registration-persistence-pass"
  | "registration-persistence-exception";

type PrismaDiagnosticScope = "user-lookup" | "registration-persistence";
type PrismaErrorCategory =
  | "prisma-known-request-error"
  | "prisma-unknown-request-error"
  | "prisma-initialization-error"
  | "prisma-validation-error"
  | "prisma-rust-panic-error"
  | "non-prisma-error";
type PrismaErrorClassEvent =
  `${PrismaDiagnosticScope}-error-class:${PrismaErrorCategory}`;
type PrismaCodeEvent =
  `${PrismaDiagnosticScope}-prisma-code:P${number}${number}${number}${number}`;

export type AuthDiagnosticEvent =
  AuthDiagnosticStage | PrismaErrorClassEvent | PrismaCodeEvent;

export const logAuthDiagnostic = (
  stage: AuthDiagnosticEvent,
  environment: Partial<NodeJS.ProcessEnv> = process.env,
  logger: (message: string) => void = console.info,
): void => {
  if (environment.AUTH_DIAGNOSTIC_LOGGING !== "true") return;

  logger(`${AUTH_DIAGNOSTIC_PREFIX} ${stage}`);
};
