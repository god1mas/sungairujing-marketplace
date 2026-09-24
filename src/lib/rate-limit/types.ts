export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export interface RateLimiter {
  consume(key: string): RateLimitResult;
}

export interface LoginRateLimiter {
  isAllowed(key: string): Promise<boolean>;
  recordFailure(key: string): Promise<RateLimitResult>;
}
