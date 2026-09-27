import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { classifyPrismaError } from "./prisma-error-diagnostic";

const sensitiveMessage = "database-host username password query argument";

describe("Prisma error diagnostics", () => {
  it("classifies a known request error with only a safe code", () => {
    const error = new Prisma.PrismaClientKnownRequestError(sensitiveMessage, {
      code: "P2002",
      clientVersion: "6.12.0",
      meta: { datasource: "sensitive-datasource", target: ["private-field"] },
    });

    const result = classifyPrismaError(error);

    expect(result).toEqual({
      category: "prisma-known-request-error",
      code: "P2002",
    });
    expect(JSON.stringify(result)).not.toContain(sensitiveMessage);
    expect(JSON.stringify(result)).not.toContain("sensitive-datasource");
    expect(JSON.stringify(result)).not.toContain("private-field");
  });

  it("classifies initialization errors without their provider message", () => {
    const result = classifyPrismaError(
      new Prisma.PrismaClientInitializationError(
        sensitiveMessage,
        "6.12.0",
        "P1001",
      ),
    );

    expect(result).toEqual({ category: "prisma-initialization-error" });
    expect(JSON.stringify(result)).not.toContain(sensitiveMessage);
    expect(JSON.stringify(result)).not.toContain("P1001");
  });

  it("classifies validation errors without their details", () => {
    const result = classifyPrismaError(
      new Prisma.PrismaClientValidationError(sensitiveMessage, {
        clientVersion: "6.12.0",
      }),
    );

    expect(result).toEqual({ category: "prisma-validation-error" });
    expect(JSON.stringify(result)).not.toContain(sensitiveMessage);
  });

  it("classifies non-Prisma errors safely", () => {
    const result = classifyPrismaError(new Error(sensitiveMessage));

    expect(result).toEqual({ category: "non-prisma-error" });
    expect(JSON.stringify(result)).not.toContain(sensitiveMessage);
  });
});
