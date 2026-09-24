import type { DefaultSession } from "next-auth";
import type { GlobalUserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      globalRole: GlobalUserRole;
      userVersion: string;
    } & DefaultSession["user"];
    issuedAt: number;
  }

  interface User {
    globalRole: GlobalUserRole;
    userVersion: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    globalRole: GlobalUserRole;
    userVersion: string;
    issuedAt: number;
  }
}
