const hre = require("hardhat");

async function main() {
  console.log("🚀 Upgrading FrothComicDaily to support variable-length word arrays...\n");

  const PROXY_ADDRESS = "0x8B576e5177b52e56fcF7f51d132234844CA3ccB6";

  // Deploy new implementation
  console.log("📦 Deploying new implementation...");
  const FrothComicDaily = await hre.ethers.getContractFactory("FrothComicDaily");
  const newImplementation = await FrothComicDaily.deploy();
  await newImplementation.waitForDeployment();
  
  const newImplAddress = await newImplementation.getAddress();
  console.log("✅ New implementation deployed at:", newImplAddress);

  // Upgrade proxy
  console.log("\n🔄 Upgrading proxy to new implementation...");
  const proxy = await hre.ethers.getContractAt("FrothComicDaily", PROXY_ADDRESS);
  const tx = await proxy.upgradeToAndCall(newImplAddress, "0x");
  
  console.log("⏳ Waiting for upgrade transaction...");
  await tx.wait();
  
  console.log("✅ Proxy upgraded successfully!");
  
  // Verify upgrade worked
  console.log("\n🧪 Testing upgraded contract...");
  const currentDay = await proxy.getCurrentDay();
  console.log("Current day:", currentDay.toString());
  
  const template = await proxy.getDailyTemplate(0);
  console.log("Day 0 template exists:", template.dayId.toString() === "0");
  
  console.log("\n🎉 Upgrade complete! Users can now submit comics with 1-10 words per panel!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
