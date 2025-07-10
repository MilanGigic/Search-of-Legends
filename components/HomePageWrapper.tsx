import { db } from "@/db";
import HomePage from "./HomePage";

const five = [1, 2, 3, 4, 5];
const HomePageWrapper = async () => {
  // Fetch data on the server
  const accounts = await db.query.accounts.findMany();

  let topFive: DbSummonerInfo[] = [];
  // for (const rank of five) {
  //   topFive = accounts.filter((account) => Number(account.rank) === rank);
  // }

  five.map((rank) => {
    const account = accounts.filter((account) => Number(account.rank) === rank);

    for (const a of account) {
      topFive.push(a);
    }
  });

  // Pass the data to the client component
  return <HomePage topFive={topFive} />;
};

export default HomePageWrapper;
