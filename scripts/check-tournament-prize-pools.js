const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  
  const TOURNAMENT_ABI = [
    "function getDayInfo(uint256 dayId) view returns (uint256 startTime, uint256 endTime, uint256 finalizationTime, uint256 creatorPool, uint256 voterPool, uint256 totalVotes, bool submissionOpen, bool votingOpen, bool finalized, uint256 secondsUntilNextPhase)"
  ];
  
  const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
  
  const tournament = new hre.ethers.Contract(TOURNAMENT_V2, TOURNAMENT_ABI, hre.ethers.provider);
  const froth = new hre.ethers.Contract(FROTH_TOKEN, ERC20_ABI, hre.ethers.provider);
  
  const dayInfo = await tournament.getDayInfo(363);
  const tournamentFrothBalance = await froth.balanceOf(TOURNAMENT_V2);
  
  console.log("=== Day 363 Prize Pools ===");
  console.log("Creator Pool:", hre.ethers.formatEther(dayInfo.creatorPool), "FROTH");
  console.log("Voter Pool:", hre.ethers.formatEther(dayInfo.voterPool), "FROTH");
  console.log("Total in pools:", hre.ethers.formatEther(dayInfo.creatorPool + dayInfo.voterPool), "FROTH");
  
  console.log("\n=== Tournament Contract Balance ===");
  console.log("Actual FROTH balance:", hre.ethers.formatEther(tournamentFrothBalance), "FROTH");
  
  console.log("\n=== Analysis ===");
  if (Number(tournamentFrothBalance) === 0) {
    console.log("❌ Tournament has 0 FROTH but shows 67 FROTH in prize pools!");
    console.log("❌ The 33 FROTH treasury share was NOT sent to treasury");
    console.log("❌ The 67 FROTH prize pools were paid out as rewards");
    console.log("\n⚠️  BUG: Treasury share (33 FROTH) was never transferred!");
  }
}

main().catch(console.error);
