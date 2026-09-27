import { hash, verify } from "@node-rs/argon2";

export type PasswordVerificationResult = "pass" | "false" | "exception";

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password);
};

export const verifyPassword = async (
  passwordHash: string,
  password: string,
): Promise<boolean> => {
  return (await verifyPasswordResult(passwordHash, password)) === "pass";
};

export const verifyPasswordResult = async (
  passwordHash: string,
  password: string,
): Promise<PasswordVerificationResult> => {
  try {
    return (await verify(passwordHash, password)) ? "pass" : "false";
  } catch {
    return "exception";
  }
};
