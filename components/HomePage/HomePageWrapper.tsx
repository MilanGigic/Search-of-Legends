"use server";

import { getTopFiveChampions } from "@/actions/champions/getTopFiveChampions";
import HomePage from "./HomePage";
import fetchChampions from "@/actions/champions/fetchChampions";

const HomePageWrapper = async () => {
  fetchChampions();

  const topFiveChampions = await getTopFiveChampions();

  return <HomePage champions={topFiveChampions} />;
};

export default HomePageWrapper;
