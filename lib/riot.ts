import pLimit from "p-limit";

const limit = pLimit(18); // ~90% of the 20/sec limit
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
  // const kdaValue =
  //   deaths === 0
  //     ? kills + assists
  //     : kills === 0 && deaths === 0 && assists === 0
  //     ? 0
  //     : (kills + assists) / deaths;
  // return Math.round(((kills + assists) / deaths) * 100) / 100;
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
    // Summoner's Rift queues
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
      return {
        map: "Summoner's Rift",
        description: "Clash",
        isRanked: true,
      };

    // Howling Abyss (ARAM) queues
    case 450:
      return {
        map: "Howling Abyss",
        description: "ARAM",
        isRanked: false,
      };
    case 720:
      return {
        map: "Howling Abyss",
        description: "ARAM Clash",
        isRanked: true,
      };

    // Rotating Game Modes
    case 900:
      return {
        map: "Summoner's Rift",
        description: "ARURF",
        isRanked: false,
      };
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
      return {
        map: "Rings of Wrath",
        description: "Arena",
        isRanked: false,
      };
    case 1900:
      return {
        map: "Summoner's Rift",
        description: "Pick URF",
        isRanked: false,
      };

    // Teamfight Tactics
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

    // Co-op vs AI
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

    // Special Event Modes
    case 910:
      return {
        map: "Crystal Scar",
        description: "Ascension",
        isRanked: false,
      };
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

    // Tutorials
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

    // Swarm Mode (PvE)
    case 1810:
    case 1820:
    case 1830:
    case 1840:
      return {
        map: "Swarm",
        description: "Swarm Mode",
        isRanked: false,
      };

    // Nexus Blitz
    case 1300:
      return {
        map: "Nexus Blitz",
        description: "Nexus Blitz",
        isRanked: false,
      };

    default:
      return {
        map: "Unknown",
        description: "Custom Game",
        isRanked: false,
      };
  }
}

export async function fetchWithRateLimit(url: string, opts?: RequestInit) {
  return limit(async () => {
    return fetch(url, opts);
  });
}

export async function fetchLatestVersion() {
  try {
    const versionRes = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );

    if (!versionRes.ok) {
      console.error(
        "Error fetching versions:",
        versionRes.status,
        versionRes.statusText
      );
    }

    const version: string[] = await versionRes.json();

    return version[0];
  } catch (error) {
    console.error("Fetching versions failed:", error);
  }
}
