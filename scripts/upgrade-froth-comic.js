// scripts/upgrade-froth-comic.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Starting FrothComicDaily upgrade...");
  
  const PROXY_ADDRESS = "0x8B576e5177b52e56fcF7f51d132234844CA3ccB6";
  
  const FrothComicDailyV3 = await ethers.getContractFactory("FrothComicDaily");
  
  console.log("📝 Preparing new implementation (forced)...");
  
  // Deploy new implementation
  const newImplementationAddress = await upgrades.prepareUpgrade(PROXY_ADDRESS, FrothComicDailyV3, {
    kind: 'uups',
    redeployImplementation: 'always'
  });
  
  console.log("✅ New implementation deployed at:", newImplementationAddress);
  console.log("📝 Upgrading proxy...");
  
  // Now upgrade the proxy to point to new implementation
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, FrothComicDailyV3, {
    kind: 'uups',
    redeployImplementation: 'always'
  });
  
  await upgraded.waitForDeployment();
  
  const finalImplementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  
  console.log("✅ Upgrade complete!");
  console.log("Proxy address (unchanged):", PROXY_ADDRESS);
  console.log("Final implementation address:", finalImplementationAddress);
  console.log("\n�� Ready to test at: https://app.immutabletype.com/froth-comics");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Upgrade failed:", error);
    process.exit(1);
  });
