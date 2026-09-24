import "server-only";

import {
  createBannerImagePath,
  createMerchantLogoPath,
  createProductImagePath,
} from "./path";
import {
  assertProductImageCount,
  processPublicImage,
  type ProcessedPublicImage,
  type PublicImageInput,
} from "./image";
import type { ObjectStorage, StorageObjectReference } from "./types";

export type UploadedPublicImage = ProcessedPublicImage & {
  reference: StorageObjectReference;
};

const uploadProcessedImage = async ({
  image,
  path,
  storage,
}: {
  image: ProcessedPublicImage;
  path: string;
  storage: ObjectStorage;
}): Promise<UploadedPublicImage> => {
  const reference = await storage.upload({
    bucket: "publicMedia",
    path,
    data: image.data,
    contentType: image.contentType,
  });
  return { ...image, reference };
};

export const uploadProductImages = async ({
  merchantId,
  productId,
  images,
  storage,
}: {
  merchantId: string;
  productId: string;
  images: PublicImageInput[];
  storage: ObjectStorage;
}): Promise<UploadedPublicImage[]> => {
  assertProductImageCount(images.length);
  const uploaded: UploadedPublicImage[] = [];

  try {
    for (const input of images) {
      const image = await processPublicImage("product", input);
      uploaded.push(
        await uploadProcessedImage({
          image,
          path: createProductImagePath(merchantId, productId, image.extension),
          storage,
        }),
      );
    }
    return uploaded;
  } catch (error) {
    await Promise.allSettled(
      uploaded.map(({ reference }) => storage.remove(reference)),
    );
    throw error;
  }
};

export const uploadMerchantLogo = async ({
  merchantId,
  image: input,
  storage,
}: {
  merchantId: string;
  image: PublicImageInput;
  storage: ObjectStorage;
}): Promise<UploadedPublicImage> => {
  const image = await processPublicImage("merchantLogo", input);
  return uploadProcessedImage({
    image,
    path: createMerchantLogoPath(merchantId, image.extension),
    storage,
  });
};

export const uploadBannerImage = async ({
  bannerId,
  image: input,
  storage,
}: {
  bannerId: string;
  image: PublicImageInput;
  storage: ObjectStorage;
}): Promise<UploadedPublicImage> => {
  const image = await processPublicImage("banner", input);
  return uploadProcessedImage({
    image,
    path: createBannerImagePath(bannerId, image.extension),
    storage,
  });
};
