const hre = require("hardhat");

async function main() {
  const OLD_TOURNAMENT_V2 = "0xCC03Df3cC5c36BDd666d1B68260f45ce0B6c02e0";
  const DAY_363 = 363;
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    OLD_TOURNAMENT_V2
  );
  
  console.log("Finalizing Day 363 on OLD Tournament V2...");
  
  const tx = await tournament.finalizeDay(DAY_363);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Day 363 finalized!");
  
  // Get winner info
  const winningTokenId = await tournament.getWinningTokenId(DAY_363);
  console.log("\nWinning Token ID:", winningTokenId.toString());
  
  // Note: This uses the OLD ComicNFT contract
  const OLD_COMIC_NFT = "0x14A7d9e732b5fC439786930Af90F93F73C4d566B";
  const ComicNFT = await hre.ethers.getContractAt(
    "ComicNFT",
    OLD_COMIC_NFT
  );
  
  const winnerAddress = await ComicNFT.ownerOf(winningTokenId);
  console.log("Winner Address:", winnerAddress);
  
  // Check claimable rewards
  const creatorReward = await tournament.getCreatorReward(DAY_363, winnerAddress);
  console.log("\nCreator Reward:", hre.ethers.formatEther(creatorReward), "FROTH");
  
  console.log("\n✅ Winner can now claim 34 FROTH!");
}

main().catch(console.error);
