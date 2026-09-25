import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { ImageValidationError } from "./errors";
import { assertProductImageCount, processPublicImage } from "./image";

const asArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
};

const createImage = async (
  format: "jpeg" | "png" | "webp",
  width = 20,
  height = 10,
) => {
  const pipeline = sharp({
    create: { width, height, channels: 3, background: "#15803d" },
  });
  return asArrayBuffer(await pipeline[format]().toBuffer());
};

describe("public image processing", () => {
  it.each([
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["webp", "image/webp"],
  ] as const)("accepts decoded %s content", async (format, mimeType) => {
    const result = await processPublicImage("product", {
      data: await createImage(format),
      mimeType,
    });
    const metadata = await sharp(Buffer.from(result.data)).metadata();

    expect(result.contentType).toBe("image/webp");
    expect(result.extension).toBe("webp");
    expect(metadata.format).toBe("webp");
    expect(result.width).toBe(20);
    expect(result.height).toBe(10);
  });

  it("rejects unsupported MIME before decoding", async () => {
    await expect(
      processPublicImage("product", {
        data: await createImage("jpeg"),
        mimeType: "image/gif",
      }),
    ).rejects.toMatchObject({ code: "INVALID_MIME" });
  });

  it("rejects malformed images with a controlled error", async () => {
    await expect(
      processPublicImage("product", {
        data: asArrayBuffer(Buffer.from("not an image")),
        mimeType: "image/jpeg",
      }),
    ).rejects.toEqual(new ImageValidationError("INVALID_IMAGE"));
  });

  it("rejects MIME-spoofed decoded content", async () => {
    await expect(
      processPublicImage("product", {
        data: await createImage("png"),
        mimeType: "image/jpeg",
      }),
    ).rejects.toMatchObject({ code: "INVALID_IMAGE" });
  });

  it("rejects oversized raw input before decoding", async () => {
    await expect(
      processPublicImage("product", {
        data: new ArrayBuffer(5 * 1024 * 1024 + 1),
        mimeType: "image/jpeg",
      }),
    ).rejects.toMatchObject({ code: "FILE_TOO_LARGE" });
  });

  it("allows the exact 5 MB product boundary to reach byte decoding", async () => {
    await expect(
      processPublicImage("product", {
        data: new ArrayBuffer(5 * 1024 * 1024),
        mimeType: "image/jpeg",
      }),
    ).rejects.toMatchObject({ code: "INVALID_IMAGE" });
  });

  it("resizes products inside 1600px without enlargement", async () => {
    const result = await processPublicImage("product", {
      data: await createImage("jpeg", 2000, 1000),
      mimeType: "image/jpeg",
    });

    expect([result.width, result.height]).toEqual([1600, 800]);
  });

  it("auto-rotates orientation and removes source metadata", async () => {
    const source = await sharp({
      create: {
        width: 1200,
        height: 600,
        channels: 3,
        background: "#15803d",
      },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const result = await processPublicImage("product", {
      data: asArrayBuffer(source),
      mimeType: "image/jpeg",
    });
    const metadata = await sharp(Buffer.from(result.data)).metadata();

    expect([result.width, result.height]).toEqual([600, 1200]);
    expect(metadata.orientation).toBeUndefined();
    expect(metadata.exif).toBeUndefined();
  });

  it("uses the documented logo and banner size rules", async () => {
    const logo = await processPublicImage("merchantLogo", {
      data: await createImage("png", 1600, 1000),
      mimeType: "image/png",
    });
    const banner = await processPublicImage("banner", {
      data: await createImage("webp", 2400, 1200),
      mimeType: "image/webp",
    });

    expect([logo.width, logo.height]).toEqual([800, 500]);
    expect([banner.width, banner.height]).toEqual([1920, 960]);
  });

  it("enforces the five-product-image count", () => {
    expect(() => assertProductImageCount(5)).not.toThrow();
    expect(() => assertProductImageCount(6)).toThrowError(
      expect.objectContaining({ code: "TOO_MANY_FILES" }),
    );
  });
});
