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
  
  const now = Math.floor(Date.now() / 1000);
  const startTime = Number(dayInfo.startTime);
  const endTime = Number(dayInfo.endTime);
  const finalizationTime = Number(dayInfo.finalizationTime);
  
  console.log("\n=== Tournament Timing ===");
  console.log("Current Time:", new Date(now * 1000).toLocaleString());
  console.log("Day Started:", new Date(startTime * 1000).toLocaleString());
  console.log("Submissions Close:", new Date(endTime * 1000).toLocaleString());
  console.log("Finalization Time:", new Date(finalizationTime * 1000).toLocaleString());
  console.log("Can Finalize:", await tournament.canFinalize(currentDay));
  
  console.log("\n=== Prize Pools ===");
  console.log("Creator Pool:", hre.ethers.formatEther(dayInfo.creatorPool), "FROTH");
  console.log("Voter Pool:", hre.ethers.formatEther(dayInfo.voterPool), "FROTH");
  console.log("Total Votes:", hre.ethers.formatEther(dayInfo.totalVotes), "BUFFAFLOW");
  
  console.log("\n=== Status ===");
  console.log("Submission Open:", dayInfo.submissionOpen);
  console.log("Voting Open:", dayInfo.votingOpen);
  console.log("Finalized:", dayInfo.finalized);
}

main().catch(console.error);
