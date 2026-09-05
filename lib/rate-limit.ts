import { redis, getClientIdentifier } from "./redis";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

export async function rateLimit(
  req: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(req);
  const key = `ratelimit:${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const results = await redis
    .multi()
    .zremrangebyscore(key, 0, windowStart)
    .zadd(key, `${now}-${Math.random()}`, `${now}`)
    .zcard(key)
    .pexpire(key, config.windowMs)
    .exec();

  const current = (results?.[2]?.[1] as number) ?? 0;
  const allowed = current <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - current);
  const resetTime = now + config.windowMs;

  return { allowed, remaining, resetTime, totalRequests: current };
}

export function getRateLimitHeaders(result: RateLimitResult, windowMs: number): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.totalRequests + result.remaining),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
    "Retry-After": result.allowed ? "" : String(Math.ceil((result.resetTime - Date.now()) / 1000)),
  };
}

export function createRateLimitResponse(
  result: RateLimitResult,
  windowMs: number,
  message = "Rate limit exceeded"
): Response {
  const headers = getRateLimitHeaders(result, windowMs);
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: "auth" },
  orders: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "orders" },
  recipient: { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: "recipient" },
  feedback: { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "feedback" },
  api: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: "api" },
} as const;