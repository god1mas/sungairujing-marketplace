import { hash } from "@node-rs/argon2";
import {
  GlobalUserRole,
  MerchantMembershipRole,
  MerchantOperationalStatus,
  MerchantVerificationStatus,
  PrismaClient,
  ProductAvailability,
} from "@prisma/client";

const prisma = new PrismaClient();

const requiredEnvironment = (
  name: "SEED_ADMIN_WHATSAPP" | "SEED_ADMIN_PASSWORD",
) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} wajib diisi untuk menjalankan development seed.`);
  }

  return value;
};

const assertSeedCredentialPolicy = (
  whatsappNumber: string,
  password: string,
) => {
  if (!/^62\d{8,15}$/.test(whatsappNumber)) {
    throw new Error(
      "SEED_ADMIN_WHATSAPP harus menggunakan format canonical 62xxxxxxxxxx.",
    );
  }

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD minimal 8 karakter.");
  }
};

const main = async () => {
  const adminWhatsapp = requiredEnvironment("SEED_ADMIN_WHATSAPP");
  const seedPassword = requiredEnvironment("SEED_ADMIN_PASSWORD");
  assertSeedCredentialPolicy(adminWhatsapp, seedPassword);

  // @node-rs/argon2 uses Argon2id as its documented default algorithm.
  const passwordHash = await hash(seedPassword);

  await prisma.$transaction(async (database) => {
    const admin = await database.user.upsert({
      where: { whatsappNumber: adminWhatsapp },
      update: {
        name: "Super Admin Sungairujing",
        passwordHash,
        globalRole: GlobalUserRole.SUPER_ADMIN,
        isActive: true,
      },
      create: {
        name: "Super Admin Sungairujing",
        whatsappNumber: adminWhatsapp,
        passwordHash,
        globalRole: GlobalUserRole.SUPER_ADMIN,
      },
    });

    const categoryDefinitions = [
      ["Makanan", "makanan", 1],
      ["Minuman", "minuman", 2],
      ["Oleh-Oleh", "oleh-oleh", 3],
      ["Kerajinan", "kerajinan", 4],
      ["Produk Rumah Tangga", "produk-rumah-tangga", 5],
      ["Lainnya", "lainnya", 6],
    ] as const;

    const categories = new Map<string, string>();

    for (const [name, slug, sortOrder] of categoryDefinitions) {
      const category = await database.category.upsert({
        where: { slug },
        update: { name, sortOrder, isActive: true },
        create: { name, slug, sortOrder },
      });
      categories.set(slug, category.id);
    }

    const merchantDefinitions = [
      {
        ownerName: "Aminah",
        ownerWhatsapp: "6280000000001",
        merchantName: "Dapur Sungairujing",
        slug: "dapur-sungairujing",
        description:
          "Contoh UMKM makanan khas untuk development Sungairujing Marketplace.",
        address: "Desa Sungairujing, Kecamatan Sangkapura, Bawean",
      },
      {
        ownerName: "Rahman",
        ownerWhatsapp: "6280000000002",
        merchantName: "Kriya Bawean",
        slug: "kriya-bawean",
        description:
          "Contoh UMKM kerajinan lokal untuk development Sungairujing Marketplace.",
        address: "Desa Sungairujing, Kecamatan Sangkapura, Bawean",
      },
    ] as const;

    const merchants = new Map<string, string>();

    for (const definition of merchantDefinitions) {
      const owner = await database.user.upsert({
        where: { whatsappNumber: definition.ownerWhatsapp },
        update: {
          name: definition.ownerName,
          passwordHash,
          globalRole: GlobalUserRole.USER,
          isActive: true,
        },
        create: {
          name: definition.ownerName,
          whatsappNumber: definition.ownerWhatsapp,
          passwordHash,
          globalRole: GlobalUserRole.USER,
          termsAcceptedAt: new Date(),
          termsVersion: "development-seed-v1",
        },
      });

      const merchant = await database.merchant.upsert({
        where: { slug: definition.slug },
        update: {
          name: definition.merchantName,
          description: definition.description,
          address: definition.address,
          publicWhatsappNumber: definition.ownerWhatsapp,
          operationalStatus: MerchantOperationalStatus.BUKA,
          verificationStatus: MerchantVerificationStatus.BELUM_DIVERIFIKASI,
        },
        create: {
          name: definition.merchantName,
          slug: definition.slug,
          description: definition.description,
          address: definition.address,
          publicWhatsappNumber: definition.ownerWhatsapp,
          operationalStatus: MerchantOperationalStatus.BUKA,
          verificationStatus: MerchantVerificationStatus.BELUM_DIVERIFIKASI,
        },
      });

      await database.merchantMembership.upsert({
        where: {
          merchantId_userId: {
            merchantId: merchant.id,
            userId: owner.id,
          },
        },
        update: { role: MerchantMembershipRole.OWNER, isActive: true },
        create: {
          merchantId: merchant.id,
          userId: owner.id,
          role: MerchantMembershipRole.OWNER,
        },
      });

      merchants.set(definition.slug, merchant.id);
    }

    const productDefinitions = [
      {
        id: "10000000-0000-4000-8000-000000000001",
        merchantSlug: "dapur-sungairujing",
        categorySlug: "makanan",
        name: "Koncok-Koncok Bawean",
        slug: "koncok-koncok-bawean",
        description:
          "Produk makanan demo khas Bawean untuk lingkungan development.",
        price: 25000,
        unit: "bungkus",
        imageId: "20000000-0000-4000-8000-000000000001",
        imageKey: "seed/products/koncok-koncok-bawean.webp",
      },
      {
        id: "10000000-0000-4000-8000-000000000002",
        merchantSlug: "dapur-sungairujing",
        categorySlug: "oleh-oleh",
        name: "Kerupuk Ikan Bawean",
        slug: "kerupuk-ikan-bawean",
        description: "Produk oleh-oleh demo untuk lingkungan development.",
        price: 18000,
        unit: "bungkus",
        imageId: "20000000-0000-4000-8000-000000000002",
        imageKey: "seed/products/kerupuk-ikan-bawean.webp",
      },
      {
        id: "10000000-0000-4000-8000-000000000003",
        merchantSlug: "kriya-bawean",
        categorySlug: "kerajinan",
        name: "Anyaman Bawean",
        slug: "anyaman-bawean",
        description:
          "Produk kerajinan demo yang relevan dengan identitas lokal Bawean.",
        price: 75000,
        unit: "buah",
        imageId: "20000000-0000-4000-8000-000000000003",
        imageKey: "seed/products/anyaman-bawean.webp",
      },
    ] as const;

    for (const definition of productDefinitions) {
      const merchantId = merchants.get(definition.merchantSlug);
      const categoryId = categories.get(definition.categorySlug);

      if (!merchantId || !categoryId) {
        throw new Error(
          `Relasi seed tidak ditemukan untuk produk ${definition.slug}.`,
        );
      }

      const product = await database.product.upsert({
        where: { slug: definition.slug },
        update: {
          merchantId,
          categoryId,
          name: definition.name,
          description: definition.description,
          price: definition.price,
          unit: definition.unit,
          availabilityStatus: ProductAvailability.TERSEDIA,
        },
        create: {
          id: definition.id,
          merchantId,
          categoryId,
          name: definition.name,
          slug: definition.slug,
          description: definition.description,
          price: definition.price,
          unit: definition.unit,
          availabilityStatus: ProductAvailability.TERSEDIA,
        },
      });

      await database.productImage.upsert({
        where: { id: definition.imageId },
        update: {
          productId: product.id,
          storageKey: definition.imageKey,
          altText: definition.name,
          isCover: true,
          mimeType: "image/webp",
          sizeBytes: 0,
        },
        create: {
          id: definition.imageId,
          productId: product.id,
          storageKey: definition.imageKey,
          altText: definition.name,
          isCover: true,
          mimeType: "image/webp",
          sizeBytes: 0,
        },
      });
    }

    await database.banner.upsert({
      where: { id: "30000000-0000-4000-8000-000000000001" },
      update: {
        title: "Produk Lokal Sungairujing",
        description: "Banner demo untuk lingkungan development.",
        imageStorageKey: "seed/banners/produk-lokal-sungairujing.webp",
        isActive: true,
        createdByUserId: admin.id,
      },
      create: {
        id: "30000000-0000-4000-8000-000000000001",
        title: "Produk Lokal Sungairujing",
        description: "Banner demo untuk lingkungan development.",
        imageStorageKey: "seed/banners/produk-lokal-sungairujing.webp",
        isActive: true,
        createdByUserId: admin.id,
      },
    });

    const featuredMerchantIds = [
      merchants.get("dapur-sungairujing"),
      merchants.get("kriya-bawean"),
    ];

    for (const [index, merchantId] of featuredMerchantIds.entries()) {
      if (!merchantId) {
        throw new Error("Merchant unggulan seed tidak ditemukan.");
      }

      await database.featuredMerchant.upsert({
        where: { merchantId },
        update: { sortOrder: index + 1, createdByUserId: admin.id },
        create: {
          merchantId,
          sortOrder: index + 1,
          createdByUserId: admin.id,
        },
      });
    }
  });

  console.info(
    "Development seed selesai: admin, 6 kategori, 2 merchant, 3 produk, 1 banner.",
  );
};

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Development seed gagal.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
