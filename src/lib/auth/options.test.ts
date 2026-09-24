import { describe, expect, it } from "vitest";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { authOptions } from "./options";

describe("Auth.js session configuration", () => {
  it("uses an eight-hour JWT session and secure cookie settings", () => {
    expect(authOptions.session).toMatchObject({
      strategy: "jwt",
      maxAge: 8 * 60 * 60,
    });
    expect(authOptions.cookies?.sessionToken?.options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  });

  it("exposes only the approved identity fields in the browser session", async () => {
    const sessionCallback = authOptions.callbacks?.session as (input: {
      session: Session;
      token: JWT;
    }) => Promise<Session>;
    const session = await sessionCallback({
      session: {
        user: {
          id: "old-id",
          globalRole: "USER",
          userVersion: "old-version",
          name: "Nama yang tidak perlu diekspos",
          email: "private@example.com",
        },
        issuedAt: 0,
        expires: "2026-09-25T00:00:00.000Z",
      },
      token: {
        userId: "user-id",
        globalRole: "SUPER_ADMIN",
        userVersion: "2026-09-24T00:00:00.000Z",
        issuedAt: 123,
      },
    });

    expect(session).toEqual({
      user: {
        id: "user-id",
        globalRole: "SUPER_ADMIN",
        userVersion: "2026-09-24T00:00:00.000Z",
      },
      issuedAt: 123,
      expires: "2026-09-25T00:00:00.000Z",
    });
    expect(JSON.stringify(session)).not.toContain("password");
  });
});
