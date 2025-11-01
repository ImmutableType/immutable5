const hre = require("hardhat");

async function main() {
  const TOURNAMENT_V2 = "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC";
  
  const TOURNAMENT_ABI = [
    "function treasury() view returns (address)",
    "function frothToken() view returns (address)"
  ];
  
  const tournament = new hre.ethers.Contract(
    TOURNAMENT_V2,
    TOURNAMENT_ABI,
    hre.ethers.provider
  );
  
  try {
    const treasuryAddress = await tournament.treasury();
    const frothAddress = await tournament.frothToken();
    
    console.log("=== Tournament V2 Configuration ===");
    console.log("Treasury address:", treasuryAddress);
    console.log("Expected treasury:", "0x00000000000000000000000228B74E66CBD624Fc");
    console.log("Match:", treasuryAddress.toLowerCase() === "0x00000000000000000000000228B74E66CBD624Fc".toLowerCase());
    console.log("\nFROTH token:", frothAddress);
  } catch (err) {
    console.error("Error reading tournament config:", err.message);
  }
}

main().catch(console.error);
