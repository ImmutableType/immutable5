// scripts/deploy-comic-nft-v2.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying ComicNFT V2 to Flow EVM Mainnet...");
  console.log("Connected wallet:", (await hre.ethers.getSigners())[0].address);

  // Contract addresses
  const TOURNAMENT_V2 = "0xCC03Df3cC5c36BDd666d1B68260f45ce0B6c02e0";
  const PROFILE_NFT = "0xDb742cD47D09Cf7e6f22F24289449C672Ef77934";

  console.log("\nDeployment parameters:");
  console.log("Tournament V2:", TOURNAMENT_V2);
  console.log("Profile NFT:", PROFILE_NFT);

  // Deploy ComicNFT
  const ComicNFT = await hre.ethers.getContractFactory("ComicNFT");
  const comicNFT = await ComicNFT.deploy(TOURNAMENT_V2, PROFILE_NFT);

  await comicNFT.waitForDeployment();
  const comicAddress = await comicNFT.getAddress();

  console.log("\n✅ ComicNFT V2 deployed to:", comicAddress);
  console.log("\n📋 Next Steps:");
  console.log("1. Verify contract on FlowScan");
  console.log("2. Call setComicNFT() on Tournament V2");
  console.log("3. Update Railway environment variables");
  console.log("4. Update local .env.production");
  
  console.log("\n🔧 Command to configure Tournament V2:");
  console.log(`cast send ${TOURNAMENT_V2} \\`);
  console.log(`  "setComicNFT(address)" \\`);
  console.log(`  ${comicAddress} \\`);
  console.log(`  --rpc-url https://mainnet.evm.nodes.onflow.org \\`);
  console.log(`  --private-key $PRIVATE_KEY`);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "Flow EVM Mainnet",
    chainId: 747,
    timestamp: new Date().toISOString(),
    contracts: {
      ComicNFT: comicAddress,
      TournamentV2: TOURNAMENT_V2,
      ProfileNFT: PROFILE_NFT
    }
  };
  
  fs.writeFileSync(
    'deployment-comic-nft-v2.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-comic-nft-v2.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });