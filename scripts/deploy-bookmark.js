const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BookmarkNFT to Flow EVM Mainnet...");
  
  // Contract addresses (Flow EVM Mainnet)
  const PROFILE_NFT_ADDRESS = "0xDb742cD47D09Cf7e6f22F24289449C672Ef77934";
  const TREASURY_ADDRESS = "0x00000000000000000000000228B74E66CBD624Fc";
  const BUFFAFLOW_ADDRESS = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
  const INITIAL_BASE_URI = "https://app.immutabletype.com/api/bookmarks/metadata/";

  console.log("📋 Deployment Configuration:");
  console.log(`  Profile NFT: ${PROFILE_NFT_ADDRESS}`);
  console.log(`  Treasury: ${TREASURY_ADDRESS}`);
  console.log(`  BUFFAFLOW (Token & NFT): ${BUFFAFLOW_ADDRESS}`);
  console.log(`  Base URI: ${INITIAL_BASE_URI}`);

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log(`\n💰 Deployer: ${deployer.address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} FLOW`);

  // Deploy BookmarkNFT contract
  console.log("\n📦 Deploying BookmarkNFT...");
  const BookmarkNFT = await ethers.getContractFactory("BookmarkNFT");
  
  const bookmarkNFT = await BookmarkNFT.deploy(
    PROFILE_NFT_ADDRESS,      // ProfileNFT address
    TREASURY_ADDRESS,         // Treasury address  
    BUFFAFLOW_ADDRESS,        // BUFFAFLOW token address
    BUFFAFLOW_ADDRESS,        // MoonBuffaflow NFT address (same as token)
    INITIAL_BASE_URI          // Base URI for metadata
  );

  console.log("⏳ Waiting for deployment confirmation...");
  await bookmarkNFT.waitForDeployment();
  
  const contractAddress = await bookmarkNFT.getAddress();
  console.log(`✅ BookmarkNFT deployed to: ${contractAddress}`);

  // Verify deployment configuration
  console.log("\n🔍 Verifying deployment configuration...");
  try {
    const mintFee = await bookmarkNFT.MINT_FEE();
    const maxBatchSize = await bookmarkNFT.MAX_BATCH_SIZE();
    const dailyLimit = await bookmarkNFT.DAILY_LIMIT();
    const buffaflowReq = await bookmarkNFT.BUFFAFLOW_REQUIREMENT();

    console.log(`   ✅ Mint Fee: ${ethers.formatEther(mintFee)} FLOW`);
    console.log(`   ✅ Max Batch Size: ${maxBatchSize}`);
    console.log(`   ✅ Daily Limit: ${dailyLimit}`);
    console.log(`   ✅ BUFFAFLOW Requirement: ${ethers.formatEther(buffaflowReq)} tokens`);
  } catch (error) {
    console.log(`   ❌ Error verifying config: ${error.message}`);
  }

  console.log(`\n🎉 Deployment Complete!`);
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Add to contracts.ts: ${contractAddress}`);
  console.log(`   2. Update frontend environment variables`);
  console.log(`   3. Test minting functionality`);
  console.log(`   4. Verify on Flow block explorer`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });