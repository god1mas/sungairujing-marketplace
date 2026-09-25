import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { assertEvidenceFileCount, validateEvidenceFile } from "./evidence";

const asArrayBuffer = (buffer: Buffer): ArrayBuffer =>
  Uint8Array.from(buffer).buffer;

const createImage = async (format: "jpeg" | "png" | "webp") =>
  asArrayBuffer(
    await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: "#15803d",
      },
    })
      [format]()
      .toBuffer(),
  );

describe("private evidence validation", () => {
  it.each([
    ["jpeg", "image/jpeg", "jpg"],
    ["png", "image/png", "png"],
    ["webp", "image/webp", "webp"],
  ] as const)(
    "accepts decoded %s evidence without transforming it",
    async (format, mimeType, extension) => {
      const data = await createImage(format);
      const result = await validateEvidenceFile({
        data,
        mimeType,
        originalFilename: `evidence.${extension}`,
      });

      expect(result).toMatchObject({ mimeType, extension });
      expect(result.data).toBe(data);
      expect(result.sizeBytes).toBe(data.byteLength);
    },
  );

  it("accepts PDF content with the documented MIME", async () => {
    const data = asArrayBuffer(Buffer.from("%PDF-1.4\n1 0 obj\n%%EOF\n"));

    await expect(
      validateEvidenceFile({
        data,
        mimeType: "application/pdf",
        originalFilename: "evidence.pdf",
      }),
    ).resolves.toMatchObject({ extension: "pdf", sizeBytes: data.byteLength });
  });

  it("rejects unsupported, malformed, and MIME-spoofed evidence", async () => {
    const jpeg = await createImage("jpeg");
    await expect(
      validateEvidenceFile({
        data: jpeg,
        mimeType: "image/gif",
        originalFilename: "fake.gif",
      }),
    ).rejects.toMatchObject({ code: "INVALID_MIME" });
    await expect(
      validateEvidenceFile({
        data: asArrayBuffer(Buffer.from("not a PDF")),
        mimeType: "application/pdf",
        originalFilename: "fake.pdf",
      }),
    ).rejects.toMatchObject({ code: "INVALID_FILE" });
    await expect(
      validateEvidenceFile({
        data: jpeg,
        mimeType: "image/png",
        originalFilename: "fake.png",
      }),
    ).rejects.toMatchObject({ code: "INVALID_FILE" });
  });

  it("rejects evidence over 8 MB before decoding", async () => {
    await expect(
      validateEvidenceFile({
        data: new ArrayBuffer(8 * 1024 * 1024 + 1),
        mimeType: "image/jpeg",
        originalFilename: "large.jpg",
      }),
    ).rejects.toMatchObject({ code: "FILE_TOO_LARGE" });
  });

  it("allows the exact 8 MB evidence boundary to reach byte validation", async () => {
    await expect(
      validateEvidenceFile({
        data: new ArrayBuffer(8 * 1024 * 1024),
        mimeType: "application/pdf",
        originalFilename: "boundary.pdf",
      }),
    ).rejects.toMatchObject({ code: "INVALID_FILE" });
  });

  it("enforces at most three total evidence files", () => {
    expect(() => assertEvidenceFileCount(2, 1)).not.toThrow();
    expect(() => assertEvidenceFileCount(2, 2)).toThrowError(
      expect.objectContaining({ code: "TOO_MANY_FILES" }),
    );
  });
});
