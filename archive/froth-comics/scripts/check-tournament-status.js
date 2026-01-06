const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    TOURNAMENT_V2
  );
  
  const currentDay = await tournament.getCurrentDay();
  console.log("Current Day:", currentDay.toString());
  
  const dayInfo = await tournament.getDayInfo(currentDay);
  console.log("\nDay Info:");
  console.log("- Submission Open:", dayInfo.submissionOpen);
  console.log("- Voting Open:", dayInfo.votingOpen);
  console.log("- Finalized:", dayInfo.finalized);
  console.log("- Creator Pool:", ethers.formatEther(dayInfo.creatorPool), "FROTH");
  console.log("- Voter Pool:", ethers.formatEther(dayInfo.voterPool), "FROTH");
  console.log("- Seconds Until Next Phase:", dayInfo.secondsUntilNextPhase.toString());
}

main().catch(console.error);
