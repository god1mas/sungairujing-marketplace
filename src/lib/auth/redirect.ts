export const getPostLoginPath = (role: "USER" | "SUPER_ADMIN"): string =>
  role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
