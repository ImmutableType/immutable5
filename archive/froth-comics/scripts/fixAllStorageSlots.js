const hre = require("hardhat");

async function main() {
  const PROXY_ADDRESS = "0x8B576e5177b52e56fcF7f51d132234844CA3ccB6";
  const GENESIS_TIMESTAMP = 1761187795;
  
  console.log("🔧 Fixing genesis timestamp in all storage locations...");
  console.log("📍 Contract:", PROXY_ADDRESS);
  console.log("⏰ Timestamp:", GENESIS_TIMESTAMP);
  console.log("📅 Date:", new Date(GENESIS_TIMESTAMP * 1000).toUTCString());
  
  // Convert timestamp to 32-byte hex
  const paddedValue = hre.ethers.zeroPadValue(
    hre.ethers.toBeHex(GENESIS_TIMESTAMP), 
    32
  );
  
  console.log("\n📝 Writing to multiple storage slots...");
  
  // Write to slot 8 (where getter reads from)
  console.log("Writing to slot 8...");
  await hre.network.provider.send("hardhat_setStorageAt", [
    PROXY_ADDRESS,
    hre.ethers.toBeHex(8),
    paddedValue
  ]);
  
  // Write to slot 63 (where validation might be reading from)
  console.log("Writing to slot 63...");
  await hre.network.provider.send("hardhat_setStorageAt", [
    PROXY_ADDRESS,
    hre.ethers.toBeHex(63),
    paddedValue
  ]);
  
  console.log("\n✅ Storage slots updated!");
  
  // Verify both slots
  console.log("\n🔍 Verification:");
  const slot8 = await hre.network.provider.send("eth_getStorageAt", [
    PROXY_ADDRESS,
    hre.ethers.toBeHex(8),
    "latest"
  ]);
  console.log("Slot 8:", BigInt(slot8).toString());
  
  const slot63 = await hre.network.provider.send("eth_getStorageAt", [
    PROXY_ADDRESS,
    hre.ethers.toBeHex(63),
    "latest"
  ]);
  console.log("Slot 63:", BigInt(slot63).toString());
  
  // Test contract functions
  console.log("\n🧪 Testing contract functions:");
  const contract = await hre.ethers.getContractAt("FrothComicDaily", PROXY_ADDRESS);
  
  const currentDay = await contract.getCurrentDay();
  console.log("Current day:", currentDay.toString());
  
  const template = await contract.getDailyTemplate(0);
  console.log("Day 0 opens:", new Date(Number(template.opensAt) * 1000).toUTCString());
}

main().catch(console.error);
