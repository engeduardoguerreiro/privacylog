import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient, type RedisClientType } from "redis";

type HeaderReader = {
  get(name: string): string | null;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function getClientIp(headersList: HeaderReader) {
  const forwardedFor = headersList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return headersList.get("x-real-ip") || "unknown";
}

// --- Upstash (compartilhado entre todas as instancias serverless) ----------

/**
 * Aceita os nomes do console da Upstash e os que a integracao da Vercel
 * (Marketplace > Upstash) cria. Sem nenhum deles, cai no limite em memoria.
 */
function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  return url && token ? new Redis({ url, token }) : null;
}

const redis = createRedis();
const limiters = new Map<string, Ratelimit>();

/** Um limiter por combinacao limite/janela, reaproveitado entre requests. */
function getLimiter(limit: number, windowMs: number) {
  const id = `${limit}:${windowMs}`;
  let limiter = limiters.get(id);

  if (!limiter && redis) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "privacylog:ratelimit",
      // Nao bloqueia a resposta esperando a gravacao de analytics da Upstash.
      analytics: false,
    });
    limiters.set(id, limiter);
  }

  return limiter;
}

// --- Redis por conexao direta (REDIS_URL) -----------------------------------

// A integracao de Redis da Vercel pode entregar so REDIS_URL (redis://...),
// sem a API REST da Upstash. Nesse caso usa uma janela fixa com INCR.
let tcpClient: Promise<RedisClientType> | null = null;

function getTcpClient() {
  const url = process.env.REDIS_URL;

  if (!url) {
    return null;
  }

  if (!tcpClient) {
    const client: RedisClientType = createClient({
      url,
      socket: { connectTimeout: 2000, reconnectStrategy: false },
    });

    client.on("error", (error) => {
      console.error("Rate limit: erro no Redis", error);
      // Conexao caida: a proxima chamada tenta reconectar do zero.
      tcpClient = null;
    });

    tcpClient = client.connect().then(() => client).catch((error) => {
      tcpClient = null;
      throw error;
    });
  }

  return tcpClient;
}

async function checkTcpRateLimit(
  clientPromise: Promise<RedisClientType>,
  { key, limit, windowMs }: { key: string; limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const client = await clientPromise;
  const window = Math.floor(Date.now() / windowMs);
  const redisKey = `privacylog:ratelimit:${key}:${window}`;
  const count = await client.incr(redisKey);

  if (count === 1) {
    await client.pExpire(redisKey, windowMs);
  }

  if (count <= limit) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil(((window + 1) * windowMs - Date.now()) / 1000)),
  };
}

/**
 * Limita tentativas por chave (IP, IP+e-mail...). Usa a Upstash (REST) ou o
 * REDIS_URL quando configurados; se nenhum estiver configurado ou o Redis
 * falhar, usa o limite em memoria por instancia, para nunca derrubar
 * login/cadastro por causa do Redis.
 */
export async function checkRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const limiter = getLimiter(limit, windowMs);

  if (limiter) {
    try {
      const result = await limiter.limit(key);

      return {
        allowed: result.success,
        retryAfterSeconds: result.success
          ? 0
          : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      };
    } catch (error) {
      console.error("Rate limit: Upstash indisponivel, usando memoria", error);
    }
  } else {
    const client = getTcpClient();

    if (client) {
      try {
        return await checkTcpRateLimit(client, { key, limit, windowMs });
      } catch (error) {
        console.error("Rate limit: Redis indisponivel, usando memoria", error);
      }
    }
  }

  return checkMemoryRateLimit({ key, limit, windowMs });
}

// --- Reserva em memoria (por instancia) -------------------------------------

const buckets = new Map<string, Bucket>();
const maxBucketCount = 1500;

function checkMemoryRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
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
