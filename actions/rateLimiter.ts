const requestTimestamps: number[] = [];

export function createRiotRateLimiter() {
  return async function limitRiotRate() {
    const now = Date.now();
    const TWO_MINUTES = 2 * 60 * 1000;
    const ONE_SECOND = 1000;

    // Remove timestamps older than 2 minutes
    while (
      requestTimestamps.length > 0 &&
      now - requestTimestamps[0] > TWO_MINUTES
    ) {
      requestTimestamps.shift();
    }

    const recentRequests = requestTimestamps.filter(
      (ts) => now - ts <= ONE_SECOND,
    );

    if (requestTimestamps.length >= 40 || recentRequests.length >= 10) {
      await delay(200);
      return limitRiotRate();
    }

    requestTimestamps.push(Date.now());
  };
}

export function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
