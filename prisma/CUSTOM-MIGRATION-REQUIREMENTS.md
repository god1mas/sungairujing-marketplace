# Custom Migration Requirements

The following PostgreSQL constraints and indexes are required by
`docs/DATABASE.md` but cannot be represented completely by the current Prisma
schema. They must be implemented and reviewed when the initial migration is
created.

| #   | Requirement                                                                     | Table                   | Purpose                                                                            | Source             | Status                                                 |
| --- | ------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------ |
| 1   | Partial unique index where `role = 'OWNER' AND is_active = true`                | `merchant_memberships`  | Enforce at most one active owner per merchant                                      | Sections 8 and 63  | IMPLEMENTED — `20260924015118_init_marketplace_schema` |
| 2   | Partial unique index where `is_cover = true`                                    | `product_images`        | Enforce at most one cover image per product                                        | Sections 16 and 63 | IMPLEMENTED — `20260924015118_init_marketplace_schema` |
| 3   | `CHECK (price >= 0)`                                                            | `products`              | Prevent negative product prices                                                    | Sections 14 and 63 | IMPLEMENTED — `20260924015118_init_marketplace_schema` |
| 4   | Partial index on `(product_id, clicked_at DESC)` where `product_id IS NOT NULL` | `whatsapp_click_events` | Support product-scoped WhatsApp analytics without indexing null product references | Section 24         | IMPLEMENTED — `20260924015118_init_marketplace_schema` |
| 5   | `CHECK (end_at >= start_at)` when both values are present                       | `banners`               | Prevent an invalid banner schedule                                                 | Section 35         | IMPLEMENTED — `20260924015118_init_marketplace_schema` |
| 6   | `CHECK (sort_order BETWEEN 1 AND 5)`                                            | `featured_merchants`    | Limit featured positions to the documented range                                   | Sections 37 and 63 | IMPLEMENTED — `20260924015118_init_marketplace_schema` |

Application-level limits and cross-field rules remain outside this custom SQL
list, including evidence/image file-count limits, rolling 24-hour view dedupe,
WhatsApp source/product consistency, report target consistency, the `OTHER`
report detail requirement, and normalized category-name duplicate prevention.

All six database objects were verified against a clean, disposable PostgreSQL
17 database. The five enforcing constraints rejected invalid test rows, and
the WhatsApp analytics index predicate was verified from the PostgreSQL
catalog.
