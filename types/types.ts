interface Account {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
}

interface SummonerInfo {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

interface CompleteAccountInfo extends Account {
  summonerInfo?: SummonerInfo;
}
