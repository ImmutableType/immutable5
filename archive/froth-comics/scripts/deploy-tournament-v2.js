const hre = require("hardhat");

async function main() {
  console.log("Deploying FrothComicTournamentV2...");
  
  // Contract addresses
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  const BUFFAFLOW_TOKEN = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
  const PROFILE_NFT = "0xDb742cD47D09Cf7e6f22F24289449C672Ef77934";
  const TREASURY = "0x00000000000000000000000228B74E66CBD624Fc";
  const COMIC_NFT = "0x14A7d9e732b5fC439786930Af90F93F73C4d566B";
  
  // Tournament epoch: Oct 29, 2024 8:00 PM EST (Miami)
  const TOURNAMENT_EPOCH = 1730246400;
  
  console.log("Constructor args:", {
    FROTH_TOKEN,
    BUFFAFLOW_TOKEN,
    PROFILE_NFT,
    TREASURY,
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
  
  // Set ComicNFT address
  console.log("Setting ComicNFT address:", COMIC_NFT);
  const tx = await tournament.setComicNFT(COMIC_NFT);
  await tx.wait();
  console.log("✅ ComicNFT address set!");
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Tournament V2:", address);
  console.log("\nUpdate your .env.production with:");
  console.log(`NEXT_PUBLIC_FROTH_TOURNAMENT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
