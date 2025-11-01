const hre = require("hardhat");

async function main() {
  const OLD_TOURNAMENT_V2 = "0xCC03Df3cC5c36BDd666d1B68260f45ce0B6c02e0";
  const DAY_363 = 363;
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    OLD_TOURNAMENT_V2
  );
  
  console.log("=== OLD Tournament V2 - Day 363 ===");
  
  const dayInfo = await tournament.getDayInfo(DAY_363);
  
  console.log("Finalized:", dayInfo.finalized);
  console.log("Creator Pool:", hre.ethers.formatEther(dayInfo.creatorPool), "FROTH");
  console.log("Voter Pool:", hre.ethers.formatEther(dayInfo.voterPool), "FROTH");
  console.log("Can finalize:", await tournament.canFinalize(DAY_363));
}

main().catch(console.error);
