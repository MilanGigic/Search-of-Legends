function getRegionalEndpoint(region: string): string {
  // Map regions to their routing values
  const regionMap: Record<string, string> = {
    br1: "americas",
    la1: "americas",
    la2: "americas",
    na1: "americas",
    eun1: "europe",
    euw1: "europe",
    tr1: "europe",
    ru: "europe",
    jp1: "asia",
    kr: "asia",
    oc1: "sea",
    ph2: "sea",
    sg2: "sea",
    th2: "sea",
    tw2: "sea",
    vn2: "sea",
  };

  const routingValue = regionMap[region.toLowerCase()];
  return routingValue;
}
export default getRegionalEndpoint;
