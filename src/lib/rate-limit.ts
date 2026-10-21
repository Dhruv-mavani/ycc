import "server-only";

// In-memory, single-instance rate limiter — good enough to blunt casual
// abuse of a public lookup endpoint. On multi-instance/serverless
// deployment this resets per instance; swap for Upstash Redis (or similar)
// before relying on it at scale.
const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}
