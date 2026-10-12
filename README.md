# BetterSoL

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Riot_API-FF4654?style=for-the-badge&logo=riotgames&logoColor=white" alt="Riot API" />
  <img src="https://img.shields.io/badge/League_of_Legends-1F2937?style=for-the-badge" alt="League of Legends" />
  <img src="https://img.shields.io/badge/Status-Active-2ea44f?style=for-the-badge" alt="Status" />
</p>

<p align="center">
  <strong>BetterSoL</strong> · <em>Understand the meta. Improve your climb.</em>
</p>

## 1. Header & Title

BetterSoL (branded as SoL.gg) is a League of Legends performance and meta-analysis platform built for players who want to learn faster, understand trends, and improve their decisions in-game.

## 2. Description & Why

BetterSoL helps players go beyond raw win/loss stats by combining Riot Games data with a clean, actionable analytics experience. Users can search for a summoner by Riot ID, review match history and recent performance, break down champion trends by role, and monitor high-elo leaderboards across Challenger, Grandmaster, and Master tiers.

The goal is simple: make player improvement more accessible. Whether someone is trying to optimize their champion pool, understand current patch trends, or study better macro and micro habits, BetterSoL is designed to turn data into practical insight.

This project is for:

- Ranked players looking to review performance and identify patterns
- Players curious about the current meta and champion trends
- Competitive League users who want a more informative alternative to basic stat pages
- Future learners and study-driven players preparing for an AI-powered coaching experience

## 3. Visuals / Demo

A live demo or screenshots will be added here as the app matures.

<p align="center">
  <img src="../assets/SoL-Demo.mp4" alt="BetterSoL demo preview" width="100%" />
</p>

> Replace this placeholder with a real screenshot, mock-up, or exported GIF from the application once available.

## 4. Tech Stack

| Category            | Stack                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| Frontend            | Next.js                                                                   |
| Language            | TypeScript                                                                |
| Styling             | CSS Modules, Tailwind-style utility patterns, or custom component styling |
| Data Source         | Riot Games API                                                            |
| Backend / API Layer | Next.js server routes or API integration layer                            |
| Data Storage        | Match and player data persistence layer (to be expanded)                  |
| Deployment          | Vercel or similar Node hosting platform                                   |

## 5. Getting Started

### Prerequisites

Before running locally, make sure you have the following installed:

- Node.js 18+
- npm or pnpm
- A Riot Games API key

### Installation

```bash
# Clone the repo
git clone https://github.com/MilanGigic/BetterSoL.git
cd BetterSoL

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the project root and add your Riot API credentials:

```bash
RIOT_API_KEY=your_api_key_here
```

If the app uses a server-side secret pattern, mirror that setup precisely in your project configuration.

### Run the app locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 6. Usage Examples

### Search for a summoner

```ts
const riotId = "PlayerName#NA1";
const profileUrl = `/summoner/${encodeURIComponent(riotId)}`;
```

### Review player stats

```ts
const playerStats = {
  matches: 42,
  winRate: 58,
  topChampion: "Ahri",
  roleBreakdown: ["Mid", "Support"],
};
```

### Explore meta insights

```ts
const patchInsights = {
  topPickRate: "32.4%",
  bestWinRate: "53.8%",
  currentTier: "S+",
};
```

These examples reflect the app's intended workflow: search a player, inspect detailed performance, and understand current champion/meta trends.

## 7. Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run local validation/tests
5. Open a pull request with a clear description of what changed and why

Please include:

- A concise summary of the feature or fix
- Screenshots or short recordings if UI changes are involved
- Notes on any API or config changes

If you find a bug or want to suggest an improvement, open an issue with as much detail as possible.

## 8. License & Contact

### License

This project is licensed under the MIT License. See the LICENSE file for details.

### Contact

For questions, collaboration, or feedback, reach out via the project repository or the maintainer profile associated with this project.

---

Built for players who want to turn data into better decisions.
