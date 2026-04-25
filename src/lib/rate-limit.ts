type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type Bucket = {
  resetAt: number;
  count: number;
};

const globalBuckets = new Map<string, Bucket>();

function now() {
  return Date.now();
}

export function getClientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("true-client-ip") ||
    "unknown"
  );
}

export function rateLimit(key: string, options: RateLimitOptions): { allowed: boolean; remaining: number; resetAt: number } {
  const t = now();
  const existing = globalBuckets.get(key);

  if (!existing || existing.resetAt <= t) {
    const bucket: Bucket = { resetAt: t + options.windowMs, count: 1 };
    globalBuckets.set(key, bucket);
    return { allowed: true, remaining: Math.max(0, options.max - 1), resetAt: bucket.resetAt };
  }

  if (existing.count >= options.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(0, options.max - existing.count), resetAt: existing.resetAt };
}

