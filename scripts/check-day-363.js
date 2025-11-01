const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  const DAY_363 = 363;
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    TOURNAMENT_V2
  );
  
  console.log("=== Day 363 Status ===");
  
  const dayInfo = await tournament.getDayInfo(DAY_363);
  
  console.log("Finalized:", dayInfo.finalized);
  console.log("Creator Pool:", hre.ethers.formatEther(dayInfo.creatorPool), "FROTH");
  console.log("Voter Pool:", hre.ethers.formatEther(dayInfo.voterPool), "FROTH");
  console.log("Total Votes:", hre.ethers.formatEther(dayInfo.totalVotes), "BUFFAFLOW");
  
  if (dayInfo.finalized) {
    const winningTokenId = await tournament.getWinningTokenId(DAY_363);
    console.log("\nWinning Token ID:", winningTokenId.toString());
    
    // Check if there were any entries
    const ComicNFT = await hre.ethers.getContractAt(
      "ComicNFT",
      "0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6"
    );
    
    const dayComics = await ComicNFT.getDayComics(DAY_363);
    console.log("Total Comics Minted:", dayComics.length);
    
    if (dayComics.length > 0) {
      const winnerAddress = await ComicNFT.ownerOf(winningTokenId);
      console.log("Winner Address:", winnerAddress);
    }
  } else {
    console.log("\n⚠️ Day 363 has NOT been finalized yet!");
    console.log("Can finalize now:", await tournament.canFinalize(DAY_363));
  }
}

main().catch(console.error);
