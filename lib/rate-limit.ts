// Simple in-memory rate limiter for demo
class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();

  async checkLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || record.resetAt < now) {
      this.requests.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    this.requests.set(key, record);
    return true;
  }

  async getRemainingRequests(key: string, limit: number): Promise<number> {
    const record = this.requests.get(key);
    if (!record || record.resetAt < Date.now()) {
      return limit;
    }
    return Math.max(0, limit - record.count);
  }
}

export const rateLimiter = new RateLimiter();

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ allowed: boolean; remaining: number }> {
  const allowed = await rateLimiter.checkLimit(identifier, limit, windowMs);
  const remaining = await rateLimiter.getRemainingRequests(identifier, limit);
  return { allowed, remaining };
}
