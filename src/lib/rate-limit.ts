/**
 * src/lib/rate-limit.ts — Module-scoped In-Memory Rate Limiter
 *
 * Implements Rules.md #17:
 * "Apply basic rate limiting only to the three Route Handlers defined in Techspec.md's
 * API Surface (/api/match/..., /api/students/:id/matches, /api/institution/dashboard)...
 * use a small in-memory per-IP limiter inside each Route Handler (a module-scoped counter
 * with a rolling time window) rather than express-rate-limit. Keep limits generous
 * (e.g. 100 requests / 15 min / IP) so judge testing isn't interrupted."
 *
 * NOTE ON SERVERLESS HOSTING:
 * An in-memory limiter is strictly best-effort on serverless platforms (such as Vercel)
 * because runtime memory state is not shared across isolated serverless lambda invocations
 * or cold-start instances. This is acceptable for hackathon demonstration purposes
 * per Rules.md #17, rather than a distributed production guarantee (e.g., Redis).
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

export function createRateLimiter(options?: {
  maxRequests?: number
  windowMs?: number
}) {
  const maxRequests = options?.maxRequests ?? 100
  const windowMs = options?.windowMs ?? 15 * 60 * 1000 // 15 minutes default
  const ipStore = new Map<string, RateLimitRecord>()

  return {
    check(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
      const now = Date.now()
      const record = ipStore.get(ip)

      // Clean up or reset if window has passed
      if (!record || now > record.resetTime) {
        const newRecord: RateLimitRecord = {
          count: 1,
          resetTime: now + windowMs,
        }
        ipStore.set(ip, newRecord)
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetTime: newRecord.resetTime,
        }
      }

      // Within existing window
      if (record.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: record.resetTime,
        }
      }

      record.count += 1
      return {
        allowed: true,
        remaining: maxRequests - record.count,
        resetTime: record.resetTime,
      }
    },
  }
}

/**
 * Extracts client IP address from standard headers in Next.js request.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}
