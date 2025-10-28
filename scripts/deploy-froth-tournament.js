const hre = require("hardhat");

async function main() {
  console.log("🎮 Deploying FROTH Comic Tournament to Flow EVM Mainnet\n");
  
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  const BUFFAFLOW_TOKEN = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
  const PROFILE_NFT = "0xDb742cD47D09Cf7e6f22F24289449C672Ef77934";
  const TREASURY = "0x85c0449121BfAA4F9009658B35aCFa0FEC62d168";
  
  // Oct 27, 2025, 8:00 PM Miami = Oct 28, 2025, 1:00 AM UTC
  const TOURNAMENT_EPOCH = Math.floor(new Date("2025-10-28T01:00:00Z").getTime() / 1000);
  
  console.log("📅 Configuration:");
  console.log("   Tournament starts: Oct 28, 2025, 1:00 AM UTC (Oct 27, 8 PM Miami)");
  console.log("   Epoch timestamp:", TOURNAMENT_EPOCH);
  console.log("   FROTH Token:", FROTH_TOKEN);
  console.log("   BUFFAFLOW Token:", BUFFAFLOW_TOKEN);
  console.log("   Profile NFT:", PROFILE_NFT);
  console.log("   Treasury:", TREASURY);
  console.log("");
  
  // Deploy Tournament
  console.log("📝 Deploying FrothComicTournament...");
  const Tournament = await hre.ethers.getContractFactory("FrothComicTournament");
  const tournament = await Tournament.deploy(
    FROTH_TOKEN,
    BUFFAFLOW_TOKEN,
    PROFILE_NFT,
    TREASURY,
    TOURNAMENT_EPOCH
  );
  
  await tournament.waitForDeployment();
  const tournamentAddress = await tournament.getAddress();
  console.log("✅ FrothComicTournament deployed:", tournamentAddress);
  console.log("");
  
  // Deploy ComicNFT
  console.log("📝 Deploying ComicNFT...");
  const ComicNFT = await hre.ethers.getContractFactory("ComicNFT");
  const comicNFT = await ComicNFT.deploy(tournamentAddress, PROFILE_NFT);
  
  await comicNFT.waitForDeployment();
  const comicNFTAddress = await comicNFT.getAddress();
  console.log("✅ ComicNFT deployed:", comicNFTAddress);
  console.log("");
  
  // Link contracts
  console.log("🔗 Linking contracts...");
  const tx = await tournament.setComicNFT(comicNFTAddress);
  await tx.wait();
  console.log("✅ Contracts linked!");
  console.log("");
  
  // Verify configuration
  console.log("🔍 Verifying configuration...");
  const currentDay = await tournament.getCurrentDay();
  const dayInfo = await tournament.getDayInfo(0);
  
  console.log("   Current day:", currentDay.toString());
  console.log("   Day 0 submissions open:", dayInfo.submissionOpen);
  console.log("   Seconds until start:", dayInfo.secondsUntilNextPhase.toString());
  console.log("");
  
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Contract Addresses:");
  console.log("   FrothComicTournament:", tournamentAddress);
  console.log("   ComicNFT:            ", comicNFTAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("📝 Update .env.production:");
  console.log(`NEXT_PUBLIC_FROTH_TOURNAMENT_ADDRESS=${tournamentAddress}`);
  console.log(`NEXT_PUBLIC_COMIC_NFT_ADDRESS=${comicNFTAddress}`);
  console.log("");
  console.log("✅ Ready for launch at 8 PM Miami time tonight!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });