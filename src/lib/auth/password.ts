import { hash, verify } from "@node-rs/argon2";

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password);
};

export const verifyPassword = async (
  passwordHash: string,
  password: string,
): Promise<boolean> => {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
};
