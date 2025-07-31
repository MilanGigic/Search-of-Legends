// lib/auth/providers/riot.ts
import { OAuthConfig } from "next-auth/providers/oauth";

const RiotProvider = (): OAuthConfig<any> => ({
  id: "riot",
  name: "Riot Games",
  type: "oauth",
  version: "2.0",
  authorization: {
    url: "https://auth.riotgames.com/authorize",
    params: { scope: "openid" },
  },
  token: "https://auth.riotgames.com/token",
  userinfo: "https://auth.riotgames.com/userinfo",
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name ?? profile.sub,
      email: null,
      image: null,
    };
  },
  clientId: process.env.RIOT_CLIENT_ID,
  clientSecret: process.env.RIOT_CLIENT_SECRET,
});

export default RiotProvider;
