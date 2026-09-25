import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { createVisitorId, hashVisitorId, isVisitorId } from "./visitor";

describe("visitor analytics identity", () => {
  it("creates a random UUID and stores only a deterministic server hash", () => {
    const first = createVisitorId();
    const second = createVisitorId();
    expect(isVisitorId(first)).toBe(true);
    expect(first).not.toBe(second);
    const hash = hashVisitorId(first, "test-only-pepper");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain(first);
    expect(hashVisitorId(first, "test-only-pepper")).toBe(hash);
  });
});
