type HeaderReader = {
  get(name: string): string | null;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const maxBucketCount = 1500;

export function getClientIp(headersList: HeaderReader) {
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return headersList.get("x-real-ip") || "unknown";
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    cleanupExpiredBuckets(now);
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return { allowed: true, retryAfterSeconds: 0 };
  }

  current.count += 1;
  buckets.set(key, current);

  if (current.count <= limit) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
  };
}

function cleanupExpiredBuckets(now: number) {
  if (buckets.size < maxBucketCount) {
    return;
  }

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  if (buckets.size < maxBucketCount) {
    return;
  }

  const overflow = buckets.size - maxBucketCount;
  let removed = 0;

  for (const key of buckets.keys()) {
    buckets.delete(key);
    removed += 1;

    if (removed > overflow) {
      return;
    }
  }
}
