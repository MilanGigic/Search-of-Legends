"use server";

import HomePage from "./HomePage";
import fetchChampions from "@/actions/champions/fetchChampions";

const HomePageWrapper = async () => {
  fetchChampions();

  return <HomePage />;
};

export default HomePageWrapper;
