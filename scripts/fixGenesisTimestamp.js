const hre = require("hardhat");

async function main() {
  const PROXY_ADDRESS = "0x8B576e5177b52e56fcF7f51d132234844CA3ccB6";
  const GENESIS_TIMESTAMP = 1761187795; // Thu, 23 Oct 2025 02:44:55 GMT

  console.log("🔧 Fixing genesis timestamp on FrothComicDaily proxy...");
  console.log("📍 Proxy address:", PROXY_ADDRESS);
  console.log("⏰ Setting timestamp to:", GENESIS_TIMESTAMP);
  console.log("📅 Date:", new Date(GENESIS_TIMESTAMP * 1000).toUTCString());

  // Get the contract instance
  const FrothComicDaily = await hre.ethers.getContractAt("FrothComicDaily", PROXY_ADDRESS);

  // Call setGenesisTimestamp
  console.log("\n📝 Calling setGenesisTimestamp()...");
  const tx = await FrothComicDaily.setGenesisTimestamp(GENESIS_TIMESTAMP);
  
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  await tx.wait();
  
  console.log("✅ Genesis timestamp set successfully!");
  
  // Verify it worked
  console.log("\n🔍 Verifying...");
  const currentDay = await FrothComicDaily.getCurrentDay();
  console.log("📊 Current day:", currentDay.toString());
  
  const template = await FrothComicDaily.getDailyTemplate(0);
  console.log("📋 Day 0 template:", {
    characterIds: template.characterIds.map(id => id.toString()),
    backgroundId: template.backgroundId.toString(),
    opens: new Date(Number(template.opensAt) * 1000).toUTCString(),
    closes: new Date(Number(template.closesAt) * 1000).toUTCString()
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
