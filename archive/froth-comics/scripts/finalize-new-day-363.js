const hre = require("hardhat");

async function main() {
  const NEW_TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  const DAY_363 = 363;
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    NEW_TOURNAMENT_V2
  );
  
  console.log("Checking Day 363 on NEW Tournament V2...");
  const dayInfo = await tournament.getDayInfo(DAY_363);
  
  console.log("Creator Pool:", hre.ethers.formatEther(dayInfo.creatorPool), "FROTH");
  console.log("Voter Pool:", hre.ethers.formatEther(dayInfo.voterPool), "FROTH");
  console.log("Can finalize:", await tournament.canFinalize(DAY_363));
  console.log("Finalized:", dayInfo.finalized);
  
  if (await tournament.canFinalize(DAY_363)) {
    console.log("\nFinalizing Day 363...");
    const tx = await tournament.finalizeDay(DAY_363);
    console.log("Transaction:", tx.hash);
    await tx.wait();
    console.log("✅ Finalized!");
    
    const winningTokenId = await tournament.getWinningTokenId(DAY_363);
    console.log("Winning Token ID:", winningTokenId.toString());
  }
}

main().catch(console.error);
