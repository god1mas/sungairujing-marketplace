import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateLogin } from "@/services/auth-service";

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-sungairujing.session-token"
          : "sungairujing.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Nomor WhatsApp dan Password",
      credentials: {
        whatsappNumber: { label: "Nomor WhatsApp", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const forwardedFor = request.headers?.["x-forwarded-for"];
        const ipAddress =
          (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
            ?.split(",")[0]
            ?.trim() || "unknown";

        return authenticateLogin(
          {
            whatsappNumber: credentials?.whatsappNumber ?? "",
            password: credentials?.password ?? "",
          },
          { ipAddress },
        );
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.globalRole = user.globalRole;
        token.userVersion = user.userVersion;
        token.issuedAt = Date.now();
        token.name = undefined;
        token.email = undefined;
        token.picture = undefined;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId,
        globalRole: token.globalRole,
        userVersion: token.userVersion,
      };

      session.issuedAt = token.issuedAt;
      return session;
    },
  },
};
