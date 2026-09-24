# Supabase Storage Setup

This document records the external infrastructure required by the Phase 3
storage foundation. It does not contain credentials.

## Required buckets

Create these buckets in the Supabase project used by the environment:

| Environment variable | Default bucket | Visibility |
|---|---|---|
| `SUPABASE_PUBLIC_MEDIA_BUCKET` | `public-media` | Public |
| `SUPABASE_PRIVATE_EVIDENCE_BUCKET` | `private-evidence` | Private |

`public-media` is reserved for merchant logos, product images, and banner
images. `private-evidence` is reserved for verification evidence and must never
be public.

## Server credentials

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only in the server deployment
environment. Never prefix the service-role key with `NEXT_PUBLIC_`, expose it to
client components, or commit it to the repository.

Application uploads use the privileged server adapter. Do not add anonymous or
authenticated client upload policies for this baseline. Private evidence access
is authorized on the server before a five-minute signed URL is issued. Private
evidence never uses a permanent public URL.

Evidence uploads accept at most three JPEG, PNG, WebP, or PDF files per
verification submission, with an 8 MB raw limit per file. Files are validated
from their content and stored without public-image conversion in the
`private-evidence` bucket.

Use separate Supabase projects for development and production where possible.
At minimum, never mix production private evidence with development/demo files.
