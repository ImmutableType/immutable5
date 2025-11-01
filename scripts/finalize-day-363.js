const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  const DAY_363 = 363;
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    TOURNAMENT_V2
  );
  
  console.log("Finalizing Day 363...");
  
  const tx = await tournament.finalizeDay(DAY_363);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Day 363 finalized!");
  
  // Get winner info
  const winningTokenId = await tournament.getWinningTokenId(DAY_363);
  console.log("\nWinning Token ID:", winningTokenId.toString());
  
  const ComicNFT = await hre.ethers.getContractAt(
    "ComicNFT",
    "0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6"
  );
  
  const winnerAddress = await ComicNFT.ownerOf(winningTokenId);
  console.log("Winner Address:", winnerAddress);
  
  // Check claimable rewards
  const creatorReward = await tournament.getCreatorReward(DAY_363, winnerAddress);
  console.log("\nCreator Reward:", hre.ethers.formatEther(creatorReward), "FROTH");
  
  console.log("\n=== Next Steps ===");
  console.log("Winner can claim their reward using:");
  console.log(`tournament.claimCreatorReward(${DAY_363})`);
}

main().catch(console.error);
