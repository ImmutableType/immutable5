const { ethers } = require("ethers");

// Contract addresses
const TOKEN_QUALIFIER_ADDRESS = "0xa27e2A0280127cf827876a4795d551865F930687";
const FROTH_ADDRESS = "0xb73bf8e6a4477a952e0338e6cc00cc0ce5ad04ba";

// TokenQualifier ABI (only the functions we need)
const TOKEN_QUALIFIER_ABI = [
  "function addQualifyingToken(uint256 tierLevel, address tokenAddress, uint256 minimumBalance) external",
  "function getQualifyingTokens(uint256 tierLevel) external view returns (address[])",
  "function getMinimumBalance(uint256 tierLevel, address tokenAddress) external view returns (uint256)",
  "function owner() external view returns (address)"
];

async function addFrothSupport() {
  // Configuration
  const TIER_LEVEL = 0; // Tier 0 for basic profile creation
  const FROTH_REQUIREMENT = "100"; // 100 FROTH tokens required
  
  try {
    // Connect to Flow EVM
    console.log("Connecting to Flow EVM Mainnet...");
    const provider = new ethers.JsonRpcProvider("https://mainnet.evm.nodes.onflow.org");
    
    // You'll need to add your admin private key
    const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    console.log("Admin wallet:", adminWallet.address);
    
    // Connect to TokenQualifier contract
    const tokenQualifier = new ethers.Contract(
      TOKEN_QUALIFIER_ADDRESS,
      TOKEN_QUALIFIER_ABI,
      adminWallet
    );
    
    // Verify ownership
    const owner = await tokenQualifier.owner();
    console.log("Contract owner:", owner);
    
    if (owner.toLowerCase() !== adminWallet.address.toLowerCase()) {
      throw new Error("Connected wallet is not the contract owner!");
    }
    
    // Check current qualifying tokens
    console.log("\nChecking current qualifying tokens for Tier 0...");
    const currentTokens = await tokenQualifier.getQualifyingTokens(TIER_LEVEL);
    console.log("Current qualifying tokens:", currentTokens);
    
    // Check if FROTH is already added
    if (currentTokens.map(t => t.toLowerCase()).includes(FROTH_ADDRESS.toLowerCase())) {
      console.log("\n✅ FROTH is already a qualifying token!");
      const balance = await tokenQualifier.getMinimumBalance(TIER_LEVEL, FROTH_ADDRESS);
      console.log("Required balance:", ethers.formatUnits(balance, 18), "FROTH");
      return;
    }
    
    // Add FROTH as qualifying token
    console.log("\nAdding FROTH as qualifying token...");
    console.log("- Tier Level:", TIER_LEVEL);
    console.log("- FROTH Address:", FROTH_ADDRESS);
    console.log("- Required Amount:", FROTH_REQUIREMENT, "FROTH");
    
    const tx = await tokenQualifier.addQualifyingToken(
      TIER_LEVEL,
      FROTH_ADDRESS,
      ethers.parseUnits(FROTH_REQUIREMENT, 18) // Assuming 18 decimals
    );
    
    console.log("\n📤 Transaction submitted:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("\n✅ Transaction confirmed!");
    console.log("Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Verify addition
    console.log("\nVerifying FROTH was added...");
    const newTokens = await tokenQualifier.getQualifyingTokens(TIER_LEVEL);
    const frothBalance = await tokenQualifier.getMinimumBalance(TIER_LEVEL, FROTH_ADDRESS);
    
    console.log("Updated qualifying tokens:", newTokens);
    console.log("FROTH minimum balance:", ethers.formatUnits(frothBalance, 18), "FROTH");
    
    console.log("\n🎉 SUCCESS! FROTH has been added as a qualifying token!");
    console.log("Users with 100+ FROTH can now create profiles for free!");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

// Run the script
console.log("=== ImmutableType: Adding FROTH Support ===\n");
addFrothSupport().catch(console.error);