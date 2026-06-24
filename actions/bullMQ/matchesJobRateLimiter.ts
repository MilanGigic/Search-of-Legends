import pLimit from "p-limit";

const limit = pLimit(15);

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

class RateWindow {
  private timestamps: number[] = [];

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

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

  msUntilFree(now: number): number {
    this.prune(now);
    if (this.timestamps.length < this.maxRequests) {
      return 0;
    }
    return this.timestamps[0] + this.windowMs - now + 1;
  }

  record(now: number) {
    this.timestamps.push(now);
  }
}

const perSecondWindow = new RateWindow(20, 1_000);
const per2MinWindow = new RateWindow(100, 120_000);

async function waitForRateWindow(): Promise<void> {
  while (true) {
    const now = Date.now();
    const waitSecond = perSecondWindow.msUntilFree(now);
    const waitTwoMin = per2MinWindow.msUntilFree(now);
    const waitMs = Math.max(waitSecond, waitTwoMin);

    if (waitMs <= 0) {
      const recordedAt = Date.now();
      perSecondWindow.record(recordedAt);
      per2MinWindow.record(recordedAt);
      return;
    }

    await delay(waitMs);
  }
}

const exponentialBackoff = (attempt: number) =>
  Math.min(5000 * Math.pow(2, attempt), 30000);

export async function fetchWithRateLimit(
  url: string,
  opts?: RequestInit,
  maxRetries: number = 3,
): Promise<Response> {
  return limit(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      await waitForRateWindow();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          ...opts,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
