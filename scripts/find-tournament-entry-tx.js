const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  const YOUR_ADDRESS = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";
  
  console.log("Finding your tournament entry transaction for Day 363...");
  console.log("\nSearch for transactions here:");
  console.log(`https://evm.flowscan.io/address/${YOUR_ADDRESS}`);
  console.log("\nLook for a transaction TO:", TOURNAMENT_V2);
  console.log("Method: enterTournament");
  console.log("Date: Around October 29-30, 2025");
  console.log("\nOnce you find it, check the 'Logs' tab in that transaction");
  console.log("Look for FROTH Transfer events showing where the 100 FROTH went");
}

main().catch(console.error);
