const { ethers } = require("ethers");

const TOKEN_QUALIFIER_ADDRESS = "0xa27e2A0280127cf827876a4795d551865F930687";
const YOUR_WALLET = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";

// Check for common admin role patterns
const POSSIBLE_ROLE_ABI = [
  "function owner() view returns (address)",
  "function admin() view returns (address)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function ADMIN_ROLE() view returns (bytes32)",
  "function deployer() view returns (address)"
];

async function checkPermissions() {
  const provider = new ethers.JsonRpcProvider("https://mainnet.evm.nodes.onflow.org");
  const contract = new ethers.Contract(TOKEN_QUALIFIER_ADDRESS, POSSIBLE_ROLE_ABI, provider);
  
  console.log("Checking permissions for:", YOUR_WALLET);
  console.log("\n");
  
  // Try different permission checks
  try {
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    console.log("You are owner:", owner.toLowerCase() === YOUR_WALLET.toLowerCase());
  } catch (e) {
    console.log("No owner() function");
  }
  
  try {
    const admin = await contract.admin();
    console.log("\nContract admin:", admin);
    console.log("You are admin:", admin.toLowerCase() === YOUR_WALLET.toLowerCase());
  } catch (e) {
    console.log("\nNo admin() function");
  }
  
  try {
    const deployer = await contract.deployer();
    console.log("\nContract deployer:", deployer);
    console.log("You are deployer:", deployer.toLowerCase() === YOUR_WALLET.toLowerCase());
  } catch (e) {
    console.log("\nNo deployer() function");
  }
  
  // Check for roles
  try {
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const hasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, YOUR_WALLET);
    console.log("\nHas DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);
  } catch (e) {
    console.log("\nNo role-based access control");
  }
}

checkPermissions().catch(console.error);