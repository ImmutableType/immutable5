const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  const YOUR_ADDRESS = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";
  
  const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
  const froth = new hre.ethers.Contract(FROTH_TOKEN, ERC20_ABI, hre.ethers.provider);
  
  console.log("=== FROTH Balances ===");
  
  const tournamentBalance = await froth.balanceOf(TOURNAMENT_V2);
  console.log("Tournament V2:", hre.ethers.formatEther(tournamentBalance), "FROTH");
  
  const yourBalance = await froth.balanceOf(YOUR_ADDRESS);
  console.log("Your address:", hre.ethers.formatEther(yourBalance), "FROTH");
  
  console.log("\n=== Analysis ===");
  console.log("If Tournament has 0 FROTH, it either:");
  console.log("1. Sent to treasury (but we don't see the transaction)");
  console.log("2. Never received FROTH from your entry");
  console.log("\nCheck your entry transaction on FlowScan:");
  console.log("Look for FROTH transfers in the transaction logs");
}

main().catch(console.error);
