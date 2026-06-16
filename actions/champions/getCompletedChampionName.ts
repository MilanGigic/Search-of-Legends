let completedName: string;
export function getCompletedChampionName(name: string) {
  switch (name) {
    case "Aurelion Sol":
      completedName = "AurelionSol";
      break;
    case "Bel'Veth":
      completedName = "Belveth";
      break;
    case "Cho'Gath":
      completedName = "Chogath";
      break;
    case "Dr. Mundo":
      completedName = "DrMundo";
      break;
    case "Jarvan IV":
      completedName = "JarvanIV";
      break;
    case "Kai'Sa":
      completedName = "Kaisa";
      break;
    case "Kog'Maw":
      completedName = "KogMaw";
      break;
    case "Kha'Zix":
      completedName = "Khazix";
      break;
    case "K'Sante":
      completedName = "KSante";
      break;
    case "LeBlanc":
      completedName = "Leblanc";
      break;
    case "Lee Sin":
      completedName = "LeeSin";
      break;
    case "Master Yi":
      completedName = "MasterYi";
      break;
    case "Miss Fortune":
      completedName = "MissFortune";
      break;
    case "Wukong":
      completedName = "MonkeyKing";
      break;
    case "Nunu & Willump":
      completedName = "Nunu";
      break;
    case "Rek'Sai":
      completedName = "RekSai";
      break;
    case "Renata Glasc":
      completedName = "Renata";
      break;
    case "Tahm Kench":
      completedName = "TahmKench";
      break;
    case "Twisted Fate":
      completedName = "TwistedFate";
      break;
    case "Vel'Koz":
      completedName = "Velkoz";
      break;
    case "Xin Zhao":
      completedName = "XinZhao";
      break;
    default:
      completedName = name;
  }

  return completedName;
}
// useEffect(() => {
//     switch (name) {
//       case "Aurelion Sol":
//         setCompletedName("AurelionSol");
//         break;
//       case "Bel'Veth":
//         setCompletedName("Belveth");
//         break;
//       case "Cho'Gath":
//         setCompletedName("Chogath");
//         break;
//       case "Dr. Mundo":
//         setCompletedName("DrMundo");
//         break;
//       case "Jarvan IV":
//         setCompletedName("JarvanIV");
//         break;
//       case "Kai'Sa":
//         setCompletedName("Kaisa");
//         break;
//       case "Kog'Maw":
//         setCompletedName("KogMaw");
//         break;
//       case "Kha'Zix":
//         setCompletedName("Khazix");
//         break;
//       case "K'Sante":
//         setCompletedName("KSante");
//         break;
//       case "LeBlanc":
//         setCompletedName("Leblanc");
//         break;
//       case "Lee Sin":
//         setCompletedName("LeeSin");
//         break;
//       case "Master Yi":
//         setCompletedName("MasterYi");
//         break;
//       case "Miss Fortune":
//         setCompletedName("MissFortune");
//         break;
//       case "Wukong":
//         setCompletedName("MonkeyKing");
//         break;
//       case "Nunu & Willump":
//         setCompletedName("Nunu");
//         break;
//       case "Rek'Sai":
//         setCompletedName("RekSai");
//         break;
//       case "Renata Glasc":
//         setCompletedName("Renata");
//         break;
//       case "Tahm Kench":
//         setCompletedName("TahmKench");
//         break;
//       case "Twisted Fate":
//         setCompletedName("TwistedFate");
//         break;
//       case "Vel'Koz":
//         setCompletedName("Velkoz");
//         break;
//       case "Xin Zhao":
//         setCompletedName("XinZhao");
//         break;
//     }
//   }, [name]);
