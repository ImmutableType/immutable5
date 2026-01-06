const hre = require("hardhat");

async function main() {
  const TREASURY = "0x00000000000000000000000228B74E66CBD624Fc";
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  const BUFFAFLOW_TOKEN = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
  
  const ERC20_ABI = [
    "function balanceOf(address account) view returns (uint256)"
  ];
  
  const froth = new hre.ethers.Contract(FROTH_TOKEN, ERC20_ABI, hre.ethers.provider);
  const buffaflow = new hre.ethers.Contract(BUFFAFLOW_TOKEN, ERC20_ABI, hre.ethers.provider);
  
  const frothBalance = await froth.balanceOf(TREASURY);
  const buffaflowBalance = await buffaflow.balanceOf(TREASURY);
  
  console.log("=== Treasury Balances ===");
  console.log("FROTH:", hre.ethers.formatEther(frothBalance), "FROTH");
  console.log("BUFFAFLOW:", hre.ethers.formatEther(buffaflowBalance), "BUFFAFLOW");
  
  console.log("\n✅ Treasury should have received 33 FROTH from your tournament entry");
  console.log("✅ Treasury should have received BUFFAFLOW from votes");
}

main().catch(console.error);
