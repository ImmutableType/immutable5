// Deploy TournamentV3 and ComicNFT correctly linked
// Run with: npx hardhat run scripts/deploy-v3-system.js --network flowMainnet

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FROTH Comics V3 System...\n");

  // Contract addresses (existing)
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  const BUFFAFLOW_TOKEN = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
  const PROFILE_NFT = "0xDb742cD47D09Cf7e6f22F24289449C672Ef77934";
  const TREASURY = "0x00000000000000000000000228B74E66CBD624Fc";
  
  // Tournament epoch (October 30, 2024 00:00:00 UTC)
  const TOURNAMENT_EPOCH = 1730246400;

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "FLOW\n");

  // Step 1: Deploy TournamentV3
  console.log("1️⃣  Deploying FrothComicTournamentV3...");
  const TournamentV3 = await hre.ethers.getContractFactory("FrothComicTournamentV3");
  const tournamentV3 = await TournamentV3.deploy(
    FROTH_TOKEN,
    BUFFAFLOW_TOKEN,
    PROFILE_NFT,
    TREASURY,
    TOURNAMENT_EPOCH
  );
  await tournamentV3.waitForDeployment();
  const tournamentV3Address = await tournamentV3.getAddress();
  console.log("✅ TournamentV3 deployed to:", tournamentV3Address);
  console.log("");

  // Step 2: Deploy ComicNFT pointing to TournamentV3
  console.log("2️⃣  Deploying ComicNFT...");
  const ComicNFT = await hre.ethers.getContractFactory("ComicNFT");
  const comicNFT = await ComicNFT.deploy(
    tournamentV3Address,  // Points to new TournamentV3
    PROFILE_NFT
  );
  await comicNFT.waitForDeployment();
  const comicNFTAddress = await comicNFT.getAddress();
  console.log("✅ ComicNFT deployed to:", comicNFTAddress);
  console.log("");

  // Step 3: Link TournamentV3 to ComicNFT
  console.log("3️⃣  Linking TournamentV3 to ComicNFT...");
  const setComicTx = await tournamentV3.setComicNFT(comicNFTAddress);
  await setComicTx.wait();
  console.log("✅ TournamentV3.setComicNFT() called successfully");
  console.log("");

  // Step 4: Verify linkage
  console.log("4️⃣  Verifying contract linkage...");
  const tournamentFromComicNFT = await comicNFT.tournament();
  const comicNFTFromTournament = await tournamentV3.comicNFT();
  
  console.log("🔗 ComicNFT points to Tournament:", tournamentFromComicNFT);
  console.log("🔗 TournamentV3 points to ComicNFT:", comicNFTFromTournament);
  
  if (tournamentFromComicNFT === tournamentV3Address && comicNFTFromTournament === comicNFTAddress) {
    console.log("✅ Contracts correctly linked!\n");
  } else {
    console.log("❌ ERROR: Contracts not properly linked!\n");
    process.exit(1);
  }

  // Step 5: Verify current day and timing
  console.log("5️⃣  Verifying tournament timing...");
  const currentDay = await tournamentV3.getCurrentDay();
  const dayInfo = await tournamentV3.getDayInfo(currentDay);
  
  console.log("📅 Current Day:", currentDay.toString());
  console.log("📅 Submissions Open:", dayInfo.submissionOpen);
  console.log("📅 Voting Open:", dayInfo.votingOpen);
  console.log("");

  // Final summary
  console.log("=" .repeat(70));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(70));
  console.log("");
  console.log("📋 Copy these addresses to your .env files:");
  console.log("");
  console.log("NEXT_PUBLIC_FROTH_TOURNAMENT_ADDRESS=" + tournamentV3Address);
  console.log("NEXT_PUBLIC_COMIC_NFT_ADDRESS=" + comicNFTAddress);
  console.log("");
  console.log("🔧 Also update Railway environment variables:");
  console.log("   NEXT_PUBLIC_FROTH_TOURNAMENT_ADDRESS=" + tournamentV3Address);
  console.log("   NEXT_PUBLIC_COMIC_NFT_ADDRESS=" + comicNFTAddress);
  console.log("");
  console.log("=" .repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });