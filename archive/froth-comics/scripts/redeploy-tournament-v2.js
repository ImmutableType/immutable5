const hre = require("hardhat");

async function main() {
  console.log("Redeploying FrothComicTournamentV2 with ComicNFT V2...");
  
  // Contract addresses
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  const BUFFAFLOW_TOKEN = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
  const PROFILE_NFT = "0xDb742cD47D09Cf7e6f22F24289449C672Ef77934";
  const TREASURY = "0x00000000000000000000000228B74E66CBD624Fc";
  const COMIC_NFT_V2 = "0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6";
  
  // Tournament epoch: Oct 29, 2024 8:00 PM EST (Miami)
  const TOURNAMENT_EPOCH = 1730246400;
  
  console.log("Constructor args:", {
    FROTH_TOKEN,
    BUFFAFLOW_TOKEN,
    PROFILE_NFT,
    TREASURY,
    COMIC_NFT_V2,
    TOURNAMENT_EPOCH: new Date(TOURNAMENT_EPOCH * 1000).toLocaleString('en-US', {timeZone: 'America/New_York'})
  });
  
  const FrothTournamentV2 = await hre.ethers.getContractFactory("FrothComicTournamentV2");
  const tournament = await FrothTournamentV2.deploy(
    FROTH_TOKEN,
    BUFFAFLOW_TOKEN,
    PROFILE_NFT,
    TREASURY,
    TOURNAMENT_EPOCH
  );
  
  await tournament.waitForDeployment();
  const address = await tournament.getAddress();
  
  console.log("✅ FrothComicTournamentV2 deployed to:", address);
  
  // Set ComicNFT V2 address
  console.log("Setting ComicNFT V2 address:", COMIC_NFT_V2);
  const tx = await tournament.setComicNFT(COMIC_NFT_V2);
  await tx.wait();
  console.log("✅ ComicNFT V2 address set!");
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Tournament V2:", address);
  console.log("ComicNFT V2:", COMIC_NFT_V2);
  console.log("\nUpdate Railway and .env.production:");
  console.log(`NEXT_PUBLIC_FROTH_TOURNAMENT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_COMIC_NFT_ADDRESS=${COMIC_NFT_V2}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
