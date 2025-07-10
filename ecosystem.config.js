export const apps = [
  {
    name: "next-web-dev",
    script: "node_modules/next/dist/bin/next",
    args: "dev -p 3000",
    env: {
      NODE_ENV: "development",
    },
  },
  {
    name: "leaderboard-worker",
    script: "./jobs/leaderboardQueue.ts",
    interpreter: "./node_modules/.bin/tsx",
  },
  {
    name: "games-worker",
    script: "./jobs/leaderboardGames.ts",
    interpreter: "./node_modules/.bin/tsx",
  },
  {
    name: "bull-monitor",
    script: "./monitor/express-server.ts",
    interpreter: "./node_modules/.bin/tsx",
  },
];
