# Cloud deployment

## Target architecture

- Frontend: portable React/Next.js application. Vercel can be used for development/preview, but the free Vercel Hobby plan is not suitable for the commercial sales site because its current terms restrict Hobby use to personal/non-commercial use.
- Database/Auth: Supabase.
- Object storage: Cloudflare R2.
- Secrets: platform environment variables only; never commit credentials.
- Payment provider: adapter to be selected later.
- Production engine: external provider operated by the producer; never exposed in the customer UI.

## Storage buckets

Use private R2 buckets or equivalent private object namespaces:

- `music-references-private`
- `music-previews-private`
- `music-masters-private`
- `music-deliverables-private`
- `music-covers-private`

No customer-facing public bucket is required.

## Delivery policy

The customer's delivery window is exactly **7 calendar days from `DELIVERED`**.

At the transition to `DELIVERED`:

1. Set `download_expires_at = delivered_at + 7 days`.
2. Create/refresh download grants for eligible final assets.
3. Do not expose storage URLs directly.
4. On each download request, authorize the order server-side.
5. Issue a short-lived signed URL, shorter than or equal to the remaining seven-day window.
6. Audit the download event.
7. After expiry, reject new download grants even if an old signed URL was discovered.

## Stems

When an order includes stems, the customer receives **one ZIP download**, not one download button per stem.

Recommended internal layout:

```text
orders/{internal-order-id}/deliverables/stems/
  vocals.wav
  instrumental.wav
  drums.wav
  bass.wav
  keys.wav
  other.wav
```

The production service or backend packages these files as:

```text
orders/{internal-order-id}/deliverables/stems.zip
```

The ZIP remains private and receives its own download grant.

## Expiration and cleanup

The seven-day policy controls customer access. Physical deletion is a separate retention policy and must not happen automatically merely because the customer can no longer download. A scheduled cleanup job may later archive/delete expired assets according to the final retention policy.

## Vercel decision

Do not make Vercel-specific APIs part of the business domain. Keep routes, storage, payments and authorization behind provider-neutral services. This lets the same frontend/backend contracts run on a different host if the commercial deployment requires it.

For a genuinely free commercial-first deployment, Cloudflare Workers/Pages can be evaluated as the hosting layer alongside R2. The application should remain portable regardless of the final choice.
