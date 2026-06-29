import pLimit from "p-limit";

const CONCURRENCY = Number(process.env.RIOT_CONCURRENCY_LIMIT ?? 15);
const limit = pLimit(CONCURRENCY);

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const SHORT_WINDOW_MAX = Number(process.env.RIOT_SHORT_WINDOW_MAX ?? 20);
const SHORT_WINDOW_MS = Number(process.env.RIOT_SHORT_WINDOW_MS ?? 1_000);
const LONG_WINDOW_MAX = Number(process.env.RIOT_LONG_WINDOW_MAX ?? 100);
const LONG_WINDOW_MS = Number(process.env.RIOT_LONG_WINDOW_MS ?? 120_000);

class RateWindow {
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number,
    readonly windowMs: number,
  ) {}

  /** Removes timestamps older than the window from the front of the array. */
  private prune(now: number) {
    const cutoff = now - this.windowMs;
    let i = 0;
    while (i < this.timestamps.length && this.timestamps[i] <= cutoff) {
      i++;
    }
    if (i > 0) {
      this.timestamps.splice(0, i);
    }
  }

  /** Returns ms to wait before this window has room, or 0 if it already does. */
  msUntilFree(now: number): number {
    this.prune(now);
    if (this.timestamps.length < this.maxRequests) {
      return 0;
    }
    // Oldest timestamp ages out of the window at timestamps[0] + windowMs.
    // Add 1ms so we land just after expiry, not exactly on it.
    return this.timestamps[0] + this.windowMs - now + 1;
  }

  /** Records a request as happening now. Call only once room is confirmed. */
  record(now: number) {
    this.timestamps.push(now);
  }

  /**
   * Updates this window's cap to match what Riot actually reports for it.
   * Called whenever a response's rate-limit headers reveal the real limit,
   * so the hardcoded/env-configured value is only ever used as a fallback
   * before the first real header is seen, not a permanent guess.
   */
  updateLimit(maxRequests: number) {
    if (maxRequests !== this.maxRequests) {
      console.log(
        `📏 Rate window cap updated from Riot headers: ${this.maxRequests} -> ${maxRequests} (per ${this.windowMs}ms)`,
      );
      this.maxRequests = maxRequests;
    }
  }
}

// App-wide windows: every Riot call, regardless of endpoint, counts here.
// Starts with one window built from the configured fallback; Riot's
// X-App-Rate-Limit header (parsed below) can report MULTIPLE windows at
// once (e.g. "20:1,100:120" = a 1-second window AND a 120-second window
// simultaneously) — appWideWindows grows to match whatever Riot actually
// reports the first time a response with that header arrives.
let appWideWindows: RateWindow[] = [
  new RateWindow(SHORT_WINDOW_MAX, SHORT_WINDOW_MS),
  new RateWindow(LONG_WINDOW_MAX, LONG_WINDOW_MS),
];

const DEFAULT_METHOD_SHORT_MAX = Number(
  process.env.RIOT_METHOD_SHORT_WINDOW_MAX ?? 5,
);
const DEFAULT_METHOD_SHORT_MS = Number(
  process.env.RIOT_METHOD_SHORT_WINDOW_MS ?? 1_000,
);

const methodWindows = new Map<string, RateWindow[]>();
// Tracks which (methodKey -> header string) combos we've already parsed,
// so we don't re-parse and re-log on every single response once a method's
// real limits are known. Re-parses if the header string itself changes
// (Riot can legitimately change limits over time).
const lastParsedHeader = new Map<string, string>();

/**
 * Parses a Riot rate-limit header value like "20:1,100:120" into a list of
 * {max, windowMs} pairs. Returns null if the header is missing or doesn't
 * parse, so callers can fall back to the existing configured windows
 * rather than discard a working configuration over a malformed header.
 */
function parseRateLimitHeader(
  header: string | null,
): { max: number; windowMs: number }[] | null {
  if (!header) return null;
  const pairs = header.split(",").map((pair) => pair.trim());
  const parsed: { max: number; windowMs: number }[] = [];
  for (const pair of pairs) {
    const [maxStr, windowSecStr] = pair.split(":");
    const max = Number(maxStr);
    const windowSec = Number(windowSecStr);
    if (
      !Number.isFinite(max) ||
      !Number.isFinite(windowSec) ||
      max <= 0 ||
      windowSec <= 0
    ) {
      return null; // malformed — don't apply a partial/garbage update
    }
    parsed.push({ max, windowMs: windowSec * 1000 });
  }
  return parsed.length > 0 ? parsed : null;
}

/**
 * Reconciles a list of existing RateWindows against a freshly parsed list
 * of {max, windowMs} pairs from a Riot header. Windows with a matching
 * windowMs get their cap updated in place (preserving recorded timestamps,
 * so we don't lose pacing history); windows for a windowMs we haven't seen
 * before are created fresh.
 */
function reconcileWindows(
  existing: RateWindow[],
  target: { max: number; windowMs: number }[],
): RateWindow[] {
  const result: RateWindow[] = [];
  for (const { max, windowMs } of target) {
    const match = existing.find((w) => w.windowMs === windowMs);
    if (match) {
      match.updateLimit(max);
      result.push(match);
    } else {
      result.push(new RateWindow(max, windowMs));
    }
  }
  return result;
}

/**
 * Extracts a stable key identifying which Riot "method" (endpoint) a URL
 * targets, independent of path parameters like puuid/matchId, and
 * independent of query params like start/count. Two calls to the same
 * endpoint for different puuids/matches share one window; that's correct,
 * since Riot's method limit is per-endpoint, not per-parameter-value.
 *
 * Patterns are checked most-specific-first and matched explicitly rather
 * than stripped with a generic "anything that looks like an ID" regex
 * chain — overlapping generic replacements can mangle each other (e.g. a
 * "/by-puuid/:id" replacement and a numeric-ID replacement both touching
 * the same path produce garbage like "/:idd/:id"). Add new patterns here
 * as new endpoints are used elsewhere in the app.
 */
function getMethodKey(url: string): string {
  const { pathname } = new URL(url);

  if (/\/lol\/match\/v5\/matches\/by-puuid\/[^/]+\/ids$/.test(pathname)) {
    return "match-v5:matches-by-puuid-ids";
  }
  if (/\/lol\/match\/v5\/matches\/[^/]+\/timeline$/.test(pathname)) {
    return "match-v5:matches-by-id-timeline";
  }
  if (/\/lol\/match\/v5\/matches\/[^/]+$/.test(pathname)) {
    return "match-v5:matches-by-id";
  }
  if (/\/riot\/account\/v1\/accounts\/by-puuid\/[^/]+$/.test(pathname)) {
    return "account-v1:accounts-by-puuid";
  }
  if (
    /\/riot\/account\/v1\/accounts\/by-riot-id\/[^/]+\/[^/]+$/.test(pathname)
  ) {
    return "account-v1:accounts-by-riot-id";
  }
  if (/\/lol\/league\/v4\/entries\/by-puuid\/[^/]+$/.test(pathname)) {
    return "league-v4:entries-by-puuid";
  }
  if (
    /\/lol\/league\/v4\/(challengerleagues|grandmasterleagues|masterleagues)\/by-queue\/[^/]+$/.test(
      pathname,
    )
  ) {
    return "league-v4:leagues-by-queue";
  }

  // Unrecognized endpoint shape — give it its own window (safe default)
  // rather than risk colliding with an unrelated endpoint, and log so this
  // can be added as an explicit pattern above.
  console.warn(
    `⚠️ Unrecognized Riot endpoint shape, using raw path as rate-limit key: ${pathname}`,
  );
  return `unknown:${pathname}`;
}

function getMethodWindows(methodKey: string): RateWindow[] {
  let windows = methodWindows.get(methodKey);
  if (!windows) {
    windows = [
      new RateWindow(DEFAULT_METHOD_SHORT_MAX, DEFAULT_METHOD_SHORT_MS),
    ];
    methodWindows.set(methodKey, windows);
  }
  return windows;
}

/**
 * Reads X-App-Rate-Limit and X-Method-Rate-Limit off a response and
 * reconciles our in-memory windows to match what Riot actually reports.
 * Safe to call on every response (success or error) — a missing or
 * unparseable header just leaves the existing windows untouched. Only
 * re-reconciles when the header string actually changes, to avoid
 * redundant work (and redundant logging) on every single call.
 */
function syncRateLimitsFromHeaders(response: Response, methodKey: string) {
  const appHeader = response.headers.get("X-App-Rate-Limit");
  if (appHeader && lastParsedHeader.get("app") !== appHeader) {
    const parsed = parseRateLimitHeader(appHeader);
    if (parsed) {
      appWideWindows = reconcileWindows(appWideWindows, parsed);
      lastParsedHeader.set("app", appHeader);
    }
  }

  const methodHeader = response.headers.get("X-Method-Rate-Limit");
  const methodHeaderCacheKey = `method:${methodKey}`;
  if (
    methodHeader &&
    lastParsedHeader.get(methodHeaderCacheKey) !== methodHeader
  ) {
    const parsed = parseRateLimitHeader(methodHeader);
    if (parsed) {
      const existing = getMethodWindows(methodKey);
      methodWindows.set(methodKey, reconcileWindows(existing, parsed));
      lastParsedHeader.set(methodHeaderCacheKey, methodHeader);
    }
  }
}

/**
 * Blocks until every app-wide window AND every window for this specific
 * method have room, then reserves a slot in all of them. Re-checks after
 * waiting, since other queued callers may have taken the freed-up slot
 * first (this can loop a few times under heavy contention, which is
 * expected and safe).
 */
async function waitForRateWindow(methodKey: string): Promise<void> {
  while (true) {
    const methodWindowsForKey = getMethodWindows(methodKey);
    const now = Date.now();

    const waits = [
      ...appWideWindows.map((w) => w.msUntilFree(now)),
      ...methodWindowsForKey.map((w) => w.msUntilFree(now)),
    ];
    const waitMs = Math.max(0, ...waits);

    if (waitMs <= 0) {
      const recordedAt = Date.now();
      for (const w of appWideWindows) w.record(recordedAt);
      for (const w of methodWindowsForKey) w.record(recordedAt);
      return;
    }

    await delay(waitMs);
  }
}

// Exponential backoff for retries after an actual 429 (belt-and-suspenders —
// the sliding window above should make these rare, but clock drift, shared
// API keys across other apps, or Riot-side quirks can still cause one).
const exponentialBackoff = (attempt: number) =>
  Math.min(5000 * Math.pow(2, attempt), 30000);

export class RiotApiKeyError extends Error {
  constructor(status: number) {
    super(`Riot API key invalid or expired (status ${status})`);
    this.name = "RiotApiKeyError";
  }
}

/**
 * Combines two abort signals into one that fires when either fires.
 * Prefers the native AbortSignal.any (Node 20+) when available, falling
 * back to a manual listener-based combination otherwise — this file
 * shouldn't silently impose a Node 20+ requirement on a project that may
 * be running an older runtime.
 */
function combineSignals(
  a: AbortSignal,
  b: AbortSignal | undefined,
): AbortSignal {
  if (!b) return a;
  if (typeof (AbortSignal as any).any === "function") {
    return (AbortSignal as any).any([a, b]);
  }
  const combined = new AbortController();
  const onAbort = () => combined.abort();
  if (a.aborted || b.aborted) {
    combined.abort();
  } else {
    a.addEventListener("abort", onAbort, { once: true });
    b.addEventListener("abort", onAbort, { once: true });
  }
  return combined.signal;
}

export async function workerRateLimit(
  url: string,
  opts?: RequestInit,
  maxRetries: number = 3,
): Promise<Response> {
  const methodKey = getMethodKey(url);
  const externalSignal = opts?.signal ?? undefined;

  return limit(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      await waitForRateWindow(methodKey);

      // If the caller already aborted (e.g. another request in the same
      // batch threw a fatal error) before we even got a turn, don't bother
      // firing this request at all.
      if (externalSignal?.aborted) {
        throw new DOMException("Aborted before request started", "AbortError");
      }

      try {
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), 10000);

        // Combine the internal timeout signal with any external signal the
        // caller passed in, so EITHER one can cancel this request. Node 18+
        // and modern browsers support AbortSignal.any for this directly.
        const combinedSignal = combineSignals(
          timeoutController.signal,
          externalSignal,
        );

        const response = await fetch(url, {
          ...opts,
          signal: combinedSignal,
        });

        clearTimeout(timeoutId);

        // Sync our in-memory windows against what Riot actually reports for
        // this method, on every response — success or error. This is what
        // corrects our initial guessed defaults to the real limits, and
        // catches Riot changing limits later too.
        syncRateLimitsFromHeaders(response, methodKey);

        // 401/403 means the API key itself is invalid or expired — this is
        // NOT a rate-limit problem and retrying will never help (the key
        // doesn't become valid on attempt 2). Riot dev keys in particular
        // expire every 24h. Throw a dedicated error type and return
        // immediately, bypassing the retry loop entirely — otherwise this
        // would fall into the generic catch block below and burn 3 retries
        // with backoff on a dead key, producing a wall of repeated failures
        // that looks like (but isn't) a rate-limiting bug.
        if (response.status === 401 || response.status === 403) {
          console.error(
            `🔑 Riot API key rejected (${response.status}). If this is a ` +
              "development key, it likely expired (dev keys last 24h) — " +
              "generate a new one from the Riot Developer Portal.",
          );
          throw new RiotApiKeyError(response.status);
        }

        // Riot still rate-limited us despite our pacing (clock drift,
        // shared key usage elsewhere, etc.) — honor Retry-After and retry.
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
          console.log(`⚠️ Rate limited, waiting ${waitTime}ms...`);
          await delay(waitTime);
          continue;
        }

        if (!response.ok && response.status >= 500) {
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`,
          );
        }

        return response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Invalid/expired key — no amount of retrying fixes this. Re-throw
        // immediately instead of falling through to the backoff-and-retry
        // logic below.
        if (error instanceof RiotApiKeyError) {
          throw error;
        }

        lastError = error;

        if (error.name === "AbortError") {
          console.error(`❌ Request timeout for URL: ${url}`);
        } else if (error.code === "ECONNRESET" || error.code === "ENOTFOUND") {
          console.error(`❌ Connection error (${error.code}) for URL: ${url}`);
        } else {
          console.error(`❌ Request failed: ${error.message}`);
        }

        if (attempt === maxRetries) {
          break;
        }

        const backoffDelay = exponentialBackoff(attempt);
        console.log(
          `⏳ Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${backoffDelay}ms delay...`,
        );
        await delay(backoffDelay);
      }
    }

    throw lastError || new Error("Request failed after all retries");
  });
}

export const calculateAccurateGameDuration = (maxTimePlayer: number) => {
  const totalMinutes = Math.floor((maxTimePlayer * 1000) / 60000);
  const totalSeconds = Math.floor(((maxTimePlayer * 1000) % 60000) / 1000);
  return `${totalMinutes}m ${totalSeconds}s`;
};

export const calculateCsPerMin = (maxTimePlayed: number, totalCs: number) => {
  const totalMinutes = Math.floor((maxTimePlayed * 1000) / 60000);
  const avgCs = totalCs / totalMinutes;
  return avgCs.toFixed(1);
};

export const kda = (kills: number, deaths: number, assists: number) => {
  let kdaValue;
  if (deaths === 0) {
    kdaValue = kills + assists;
  } else if (kills === 0 && deaths === 0 && assists === 0) {
    kdaValue = 0;
  } else {
    kdaValue = ((kills + assists) / deaths) * 100;
  }
  return Math.round(kdaValue) / 100;
};

export default function getQueueInfo(queueId: number) {
  switch (queueId) {
    case 400:
      return {
        map: "Summoner's Rift",
        description: "5v5 Draft Pick",
        isRanked: false,
      };
    case 420:
      return {
        map: "Summoner's Rift",
        description: "5v5 Ranked Solo",
        isRanked: true,
      };
    case 430:
      return {
        map: "Summoner's Rift",
        description: "5v5 Blind Pick",
        isRanked: false,
      };
    case 440:
      return {
        map: "Summoner's Rift",
        description: "5v5 Ranked Flex",
        isRanked: true,
      };
    case 490:
      return {
        map: "Summoner's Rift",
        description: "Normal (Quickplay)",
        isRanked: false,
      };
    case 700:
      return { map: "Summoner's Rift", description: "Clash", isRanked: true };
    case 450:
      return { map: "Howling Abyss", description: "ARAM", isRanked: false };
    case 720:
      return {
        map: "Howling Abyss",
        description: "ARAM Clash",
        isRanked: true,
      };
    case 900:
      return { map: "Summoner's Rift", description: "ARURF", isRanked: false };
    case 1020:
      return {
        map: "Summoner's Rift",
        description: "One for All",
        isRanked: false,
      };
    case 1400:
      return {
        map: "Summoner's Rift",
        description: "Ultimate Spellbook",
        isRanked: false,
      };
    case 1700:
    case 1710:
      return { map: "Rings of Wrath", description: "Arena", isRanked: false };
    case 1900:
      return {
        map: "Summoner's Rift",
        description: "Pick URF",
        isRanked: false,
      };
    case 1090:
      return {
        map: "Convergence",
        description: "Teamfight Tactics",
        isRanked: false,
      };
    case 1100:
      return {
        map: "Convergence",
        description: "Ranked Teamfight Tactics",
        isRanked: true,
      };
    case 1110:
      return {
        map: "Convergence",
        description: "Teamfight Tactics Tutorial",
        isRanked: false,
      };
    case 830:
    case 870:
      return {
        map: "Summoner's Rift",
        description: "Co-op vs AI Intro",
        isRanked: false,
      };
    case 840:
    case 880:
      return {
        map: "Summoner's Rift",
        description: "Co-op vs AI Beginner",
        isRanked: false,
      };
    case 850:
    case 890:
      return {
        map: "Summoner's Rift",
        description: "Co-op vs AI Intermediate",
        isRanked: false,
      };
    case 910:
      return { map: "Crystal Scar", description: "Ascension", isRanked: false };
    case 920:
      return {
        map: "Howling Abyss",
        description: "Legend of the Poro King",
        isRanked: false,
      };
    case 940:
      return {
        map: "Summoner's Rift",
        description: "Nexus Siege",
        isRanked: false,
      };
    case 950:
      return {
        map: "Summoner's Rift",
        description: "Doom Bots Voting",
        isRanked: false,
      };
    case 960:
      return {
        map: "Summoner's Rift",
        description: "Doom Bots Standard",
        isRanked: false,
      };
    case 2000:
      return {
        map: "Summoner's Rift",
        description: "Tutorial 1",
        isRanked: false,
      };
    case 2010:
      return {
        map: "Summoner's Rift",
        description: "Tutorial 2",
        isRanked: false,
      };
    case 2020:
      return {
        map: "Summoner's Rift",
        description: "Tutorial 3",
        isRanked: false,
      };
    case 1810:
    case 1820:
    case 1830:
    case 1840:
      return { map: "Swarm", description: "Swarm Mode", isRanked: false };
    case 1300:
      return {
        map: "Nexus Blitz",
        description: "Nexus Blitz",
        isRanked: false,
      };
    default:
      return { map: "Unknown", description: "Custom Game", isRanked: false };
  }
}
