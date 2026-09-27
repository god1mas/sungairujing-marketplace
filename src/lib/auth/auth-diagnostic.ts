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
  | "authorize-success";

export const logAuthDiagnostic = (
  stage: AuthDiagnosticStage,
  environment: Partial<NodeJS.ProcessEnv> = process.env,
  logger: (message: string) => void = console.info,
): void => {
  if (environment.AUTH_DIAGNOSTIC_LOGGING !== "true") return;

  logger(`${AUTH_DIAGNOSTIC_PREFIX} ${stage}`);
};
