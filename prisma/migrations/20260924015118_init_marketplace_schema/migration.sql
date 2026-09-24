-- CreateEnum
CREATE TYPE "global_user_role" AS ENUM ('USER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "merchant_membership_role" AS ENUM ('OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "merchant_status" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "merchant_operational_status" AS ENUM ('BUKA', 'TUTUP', 'LIBUR_SEMENTARA');

-- CreateEnum
CREATE TYPE "merchant_verification_status" AS ENUM ('BELUM_DIVERIFIKASI', 'TERVERIFIKASI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "product_availability" AS ENUM ('TERSEDIA', 'HABIS');

-- CreateEnum
CREATE TYPE "product_moderation_status" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "verification_submission_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "whatsapp_click_source" AS ENUM ('PRODUCT_DETAIL', 'MERCHANT_PROFILE', 'CHECKOUT');

-- CreateEnum
CREATE TYPE "report_target_type" AS ENUM ('PRODUCT', 'MERCHANT');

-- CreateEnum
CREATE TYPE "report_reason" AS ENUM ('ILLEGAL_OR_PROHIBITED', 'DANGEROUS_PRODUCT', 'FRAUD_OR_MISLEADING', 'PHOTO_DESCRIPTION_MISMATCH', 'SPAM', 'OTHER');

-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('BARU', 'DITINJAU', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'PRODUCT_SUSPENDED', 'MERCHANT_SUSPENDED', 'MERCHANT_REACTIVATED');

-- CreateEnum
CREATE TYPE "moderation_action_type" AS ENUM ('PRODUCT_SUSPENDED', 'PRODUCT_UNSUSPENDED', 'MERCHANT_SUSPENDED', 'MERCHANT_REACTIVATED', 'PRODUCT_DELETED', 'MERCHANT_DELETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "whatsapp_number" VARCHAR NOT NULL,
    "password_hash" TEXT NOT NULL,
    "global_role" "global_user_role" NOT NULL,
    "terms_accepted_at" TIMESTAMPTZ,
    "terms_version" VARCHAR,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "description" TEXT,
    "logo_storage_key" TEXT,
    "address" TEXT NOT NULL,
    "public_whatsapp_number" VARCHAR NOT NULL,
    "opening_hours" JSONB,
    "operational_status" "merchant_operational_status" NOT NULL,
    "status" "merchant_status" NOT NULL DEFAULT 'ACTIVE',
    "verification_status" "merchant_verification_status" NOT NULL,
    "suspension_reason" TEXT,
    "suspended_at" TIMESTAMPTZ,
    "suspended_by_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_memberships" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "merchant_membership_role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "merchant_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "unit" VARCHAR NOT NULL,
    "availability_status" "product_availability" NOT NULL,
    "moderation_status" "product_moderation_status" NOT NULL DEFAULT 'ACTIVE',
    "suspension_reason" TEXT,
    "suspended_at" TIMESTAMPTZ,
    "suspended_by_user_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "alt_text" VARCHAR,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "mime_type" VARCHAR NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_submissions" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "status" "verification_submission_status" NOT NULL,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,
    "reviewed_by_user_id" UUID,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "verification_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_evidences" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "mime_type" VARCHAR NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_view_events" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "visitor_key_hash" VARCHAR NOT NULL,
    "counted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_view_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_click_events" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "product_id" UUID,
    "source" "whatsapp_click_source" NOT NULL,
    "visitor_key_hash" VARCHAR,
    "clicked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "target_type" "report_target_type" NOT NULL,
    "reported_product_id" UUID,
    "reported_merchant_id" UUID,
    "target_name_snapshot" VARCHAR NOT NULL,
    "reason" "report_reason" NOT NULL,
    "details" TEXT,
    "reporter_name" VARCHAR,
    "reporter_whatsapp" VARCHAR,
    "status" "report_status" NOT NULL DEFAULT 'BARU',
    "reviewed_by_user_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "resolution_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" UUID NOT NULL,
    "action_type" "moderation_action_type" NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "merchant_id" UUID,
    "product_id" UUID,
    "target_name_snapshot" VARCHAR NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "merchant_id" UUID,
    "type" "notification_type" NOT NULL,
    "title" VARCHAR NOT NULL,
    "message" TEXT NOT NULL,
    "related_product_id" UUID,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" UUID NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "image_storage_key" TEXT NOT NULL,
    "cta_text" VARCHAR,
    "target_url" TEXT,
    "start_at" TIMESTAMPTZ,
    "end_at" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_merchants" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "sort_order" SMALLINT NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "featured_merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_number_key" ON "users"("whatsapp_number");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_slug_key" ON "merchants"("slug");

-- CreateIndex
CREATE INDEX "merchant_memberships_user_id_is_active_idx" ON "merchant_memberships"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "merchant_memberships_merchant_id_is_active_idx" ON "merchant_memberships"("merchant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_memberships_merchant_id_user_id_key" ON "merchant_memberships"("merchant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_merchant_id_created_at_idx" ON "products"("merchant_id", "created_at");

-- CreateIndex
CREATE INDEX "products_category_id_created_at_idx" ON "products"("category_id", "created_at");

-- CreateIndex
CREATE INDEX "products_moderation_status_created_at_idx" ON "products"("moderation_status", "created_at");

-- CreateIndex
CREATE INDEX "products_availability_status_created_at_idx" ON "products"("availability_status", "created_at");

-- CreateIndex
CREATE INDEX "verification_submissions_merchant_id_submitted_at_idx" ON "verification_submissions"("merchant_id", "submitted_at" DESC);

-- CreateIndex
CREATE INDEX "verification_submissions_status_submitted_at_idx" ON "verification_submissions"("status", "submitted_at" DESC);

-- CreateIndex
CREATE INDEX "product_view_events_product_id_counted_at_idx" ON "product_view_events"("product_id", "counted_at" DESC);

-- CreateIndex
CREATE INDEX "product_view_events_product_id_visitor_key_hash_counted_at_idx" ON "product_view_events"("product_id", "visitor_key_hash", "counted_at" DESC);

-- CreateIndex
CREATE INDEX "whatsapp_click_events_merchant_id_clicked_at_idx" ON "whatsapp_click_events"("merchant_id", "clicked_at" DESC);

-- CreateIndex
CREATE INDEX "whatsapp_click_events_source_clicked_at_idx" ON "whatsapp_click_events"("source", "clicked_at" DESC);

-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reports_reported_merchant_id_created_at_idx" ON "reports"("reported_merchant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "reports_reported_product_id_created_at_idx" ON "reports"("reported_product_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_recipient_user_id_read_at_created_at_idx" ON "notifications"("recipient_user_id", "read_at", "created_at" DESC);

-- CreateIndex
CREATE INDEX "banners_is_active_start_at_end_at_idx" ON "banners"("is_active", "start_at", "end_at");

-- CreateIndex
CREATE UNIQUE INDEX "featured_merchants_merchant_id_key" ON "featured_merchants"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "featured_merchants_sort_order_key" ON "featured_merchants"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- AddForeignKey
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_suspended_by_user_id_fkey" FOREIGN KEY ("suspended_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_memberships" ADD CONSTRAINT "merchant_memberships_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_memberships" ADD CONSTRAINT "merchant_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_suspended_by_user_id_fkey" FOREIGN KEY ("suspended_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_submissions" ADD CONSTRAINT "verification_submissions_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_submissions" ADD CONSTRAINT "verification_submissions_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_evidences" ADD CONSTRAINT "verification_evidences_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "verification_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_view_events" ADD CONSTRAINT "product_view_events_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_view_events" ADD CONSTRAINT "product_view_events_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_click_events" ADD CONSTRAINT "whatsapp_click_events_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_click_events" ADD CONSTRAINT "whatsapp_click_events_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_product_id_fkey" FOREIGN KEY ("reported_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_merchant_id_fkey" FOREIGN KEY ("reported_merchant_id") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_product_id_fkey" FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_merchants" ADD CONSTRAINT "featured_merchants_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_merchants" ADD CONSTRAINT "featured_merchants_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enforce at most one active OWNER membership per merchant.
CREATE UNIQUE INDEX "uq_active_owner_per_merchant"
ON "merchant_memberships" ("merchant_id")
WHERE "role" = 'OWNER' AND "is_active" = true;

-- Enforce at most one cover image per product.
CREATE UNIQUE INDEX "uq_product_cover"
ON "product_images" ("product_id")
WHERE "is_cover" = true;

-- Product prices cannot be negative.
ALTER TABLE "products"
ADD CONSTRAINT "products_price_nonnegative_check"
CHECK ("price" >= 0);

-- Support product-scoped WhatsApp analytics without indexing null references.
CREATE INDEX "idx_whatsapp_click_product_time"
ON "whatsapp_click_events" ("product_id", "clicked_at" DESC)
WHERE "product_id" IS NOT NULL;

-- If both schedule bounds exist, a banner cannot end before it starts.
ALTER TABLE "banners"
ADD CONSTRAINT "banners_valid_date_range_check"
CHECK ("start_at" IS NULL OR "end_at" IS NULL OR "end_at" >= "start_at");

-- Featured merchant positions are limited to the five documented slots.
ALTER TABLE "featured_merchants"
ADD CONSTRAINT "featured_merchants_sort_order_range_check"
CHECK ("sort_order" BETWEEN 1 AND 5);
