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
