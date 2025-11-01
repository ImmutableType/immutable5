const hre = require("hardhat");

async function main() {
  const NEW_TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  const YOUR_ADDRESS = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";
  const DAY_363 = 363;
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    NEW_TOURNAMENT_V2
  );
  
  const winningTokenId = await tournament.getWinningTokenId(DAY_363);
  console.log("Winning Token ID:", winningTokenId.toString());
  
  const comicNFT = await hre.ethers.getContractAt(
    "ComicNFT",
    "0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6"
  );
  
  const winner = await comicNFT.ownerOf(winningTokenId);
  console.log("Winner Address:", winner);
  console.log("That's you:", winner.toLowerCase() === YOUR_ADDRESS.toLowerCase());
  
  const creatorReward = await tournament.getCreatorReward(DAY_363, YOUR_ADDRESS);
  console.log("\nYour Creator Reward:", hre.ethers.formatEther(creatorReward), "FROTH");
  
  const voterReward = await tournament.getVoterReward(DAY_363, YOUR_ADDRESS);
  console.log("Your Voter Reward:", hre.ethers.formatEther(voterReward), "FROTH");
  
  if (Number(creatorReward) > 0 || Number(voterReward) > 0) {
    console.log("\n✅ You have rewards to claim!");
  } else {
    console.log("\n❌ No rewards available (already claimed or didn't win)");
  }
}

main().catch(console.error);
