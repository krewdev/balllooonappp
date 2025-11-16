/**
 * Simple in-memory rate limiting for API routes
 * 
 * For production, consider using Redis or a dedicated rate limiting service
 * like Upstash Redis or Vercel's rate limiting.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
};

/**
 * Get client identifier from request
 */
function getClientId(request: Request): string {
  // Try to get IP from headers (works with Vercel and most proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}:${userAgent}`;
}

/**
 * Clean up expired entries (run periodically)
 */
function cleanup() {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 5 * 60 * 1000);
}

/**
 * Check if request should be rate limited
 * 
 * @param request - The incoming request
 * @param config - Rate limit configuration (optional)
 * @returns Object with `allowed` boolean and `retryAfter` seconds if limited
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; retryAfter?: number } {
  const clientId = getClientId(request);
  const now = Date.now();
  
  // Clean up expired entries
  cleanup();
  
  const entry = store[clientId];
  
  if (!entry || entry.resetTime < now) {
    // New window or expired - reset
    store[clientId] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return { allowed: true };
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Increment count
  entry.count++;
  return { allowed: true };
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
  },
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour
  },
  sms: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 SMS sends per hour
  },
  general: defaultConfig,
};

