const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0xCC03Df3cC5c36BDd666d1B68260f45ce0B6c02e0";
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV2",
    TOURNAMENT_V2
  );
  
  const comicNFTAddress = await tournament.comicNFT();
  console.log("Tournament V2 ComicNFT address:", comicNFTAddress);
  console.log("Our new ComicNFT V2 address:", "0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6");
  
  if (comicNFTAddress.toLowerCase() === "0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6".toLowerCase()) {
    console.log("✅ MATCH! Already configured correctly!");
  } else {
    console.log("❌ MISMATCH - Tournament is pointing to a different address");
  }
}

main().catch(console.error);
