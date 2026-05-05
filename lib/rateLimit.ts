import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type RateLimitPreset =
  | "login"
  | "register"
  | "resendVerification"
  | "passwordResetRequest"
  | "passwordResetConfirm";

const limiters: Record<RateLimitPreset, Ratelimit> = {
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "rl:login",
  }),
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:register",
  }),
  resendVerification: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2, "10 m"),
    prefix: "rl:resend",
  }),
  passwordResetRequest: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:pwreset-req",
  }),
  passwordResetConfirm: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "rl:pwreset-confirm",
  }),
};

/**
 * Returns { success: true } or throws a standardized error string.
 * identifier — typically IP or email for per-user limits.
 */
export async function checkRateLimit(
  preset: RateLimitPreset,
  identifier: string
): Promise<void> {
  const { success, reset } = await limiters[preset].limit(identifier);
  if (!success) {
    const retryAfterSecs = Math.ceil((reset - Date.now()) / 1000);
    throw new Error(`rate_limited:${retryAfterSecs}`);
  }
}