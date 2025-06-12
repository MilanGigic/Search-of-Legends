function getFrontendRegion(region: string): string {
  // Map regions to their routing values
  const regionMap: Record<string, string> = {
    br1: "BR",
    la1: "LAN",
    la2: "LAS",
    na1: "NA",
    eun1: "EUNE",
    euw1: "EUW",
    tr1: "TR",
    ru: "RU",
    jp1: "JP",
    kr: "KR",
    oc1: "OCE",
    ph2: "PH",
    sg2: "SG",
    th2: "TH",
    tw2: "TW",
    vn2: "VN",
  };

  const routingValue = regionMap[region.toLowerCase()];
  return routingValue;
}
export default getFrontendRegion;
