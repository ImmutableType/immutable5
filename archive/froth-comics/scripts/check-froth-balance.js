const hre = require("hardhat");

async function main() {
  const YOUR_ADDRESS = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  
  const ERC20_ABI = [
    "function balanceOf(address account) view returns (uint256)"
  ];
  
  const froth = new hre.ethers.Contract(
    FROTH_TOKEN,
    ERC20_ABI,
    hre.ethers.provider
  );
  
  const balance = await froth.balanceOf(YOUR_ADDRESS);
  console.log("Your FROTH balance:", hre.ethers.formatEther(balance), "FROTH");
  
  console.log("\n✅ Check if you received 34 FROTH from the creator reward claim!");
}

main().catch(console.error);
