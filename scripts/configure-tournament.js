const hre = require("hardhat");

async function main() {
  console.log("Configuring Tournament V2 with ComicNFT address...");
  
  const TOURNAMENT_V2 = "0xCC03Df3cC5c36BDd666d1B68260f45ce0B6c02e0";
  const COMIC_NFT_V2 = "0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6";
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    TOURNAMENT_V2
  );
  
  console.log("Calling setComicNFT...");
  const tx = await tournament.setComicNFT(COMIC_NFT_V2);
  await tx.wait();
  
  console.log("✅ Tournament V2 configured!");
  console.log("Transaction:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
