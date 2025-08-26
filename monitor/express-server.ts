import express from "express";
import { createServer } from "http";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { leaderboardQueue } from "../jobs/leaderboardQueue";
import { gamesQueue } from "../jobs/gamesQueue";

console.log("✅ Starting Bull Board Express server...");

const app = express();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

try {
  createBullBoard({
    queues: [
      new BullMQAdapter(leaderboardQueue),
      new BullMQAdapter(gamesQueue),
    ],
    serverAdapter,
  });
} catch (err) {
  console.error("Bull Board failed to initialize:", err);
}

app.use("/admin/queues", serverAdapter.getRouter());

const server = createServer(app);

server.listen(3002, () => {
  console.log("✅ Bull Board running at http://localhost:3002/admin/queues");
});
