export const normalizeAdminUsername = (value: string): string =>
  value.trim().toLowerCase();

export const isValidAdminUsername = (value: string): boolean =>
  /^[a-z][a-z0-9_]{3,31}$/.test(value);
