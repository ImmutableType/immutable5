const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  const TREASURY = "0x00000000000000000000000228B74E66CBD624Fc";
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  
  console.log("Checking if Tournament V2 has FROTH approval to send to treasury...");
  
  const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
  const froth = new hre.ethers.Contract(FROTH_TOKEN, ERC20_ABI, hre.ethers.provider);
  
  const tournamentBalance = await froth.balanceOf(TOURNAMENT_V2);
  console.log("Tournament V2 FROTH balance:", hre.ethers.formatEther(tournamentBalance));
  
  console.log("\nIf tournament balance is 0, it means FROTH was successfully forwarded to treasury");
  console.log("Check block explorer for transfer events:");
  console.log(`https://evm.flowscan.io/address/${TREASURY}`);
}

main().catch(console.error);
