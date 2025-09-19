// scripts/deploy-fixed-contracts.js
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting Flow EVM Mainnet Deployment...\n");
    
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await deployer.provider.getBalance(deployer.address);
    
    // Treasury wallet configuration
    const TREASURY_WALLET = "0x00000000000000000000000228B74E66CBD624Fc";
    
    console.log("📍 Network: Flow EVM Mainnet (Chain ID: 747)");
    console.log("🔑 Deployer:", deployer.address);
    console.log("🏦 Treasury:", TREASURY_WALLET);
    console.log("💰 Balance:", ethers.formatEther(deployerBalance), "FLOW\n");
    
    if (deployerBalance < ethers.parseEther("10")) {
        throw new Error("❌ Insufficient balance! Need at least 10 FLOW for deployment");
    }
    
    // Step 1: Deploy TokenQualifierFixed
    console.log("📦 Deploying TokenQualifierFixed...");
    const TokenQualifierFixed = await ethers.getContractFactory("TokenQualifierFixed");
    const tokenQualifier = await TokenQualifierFixed.deploy();
    await tokenQualifier.waitForDeployment();
    const tokenQualifierAddress = await tokenQualifier.getAddress();
    
    console.log("✅ TokenQualifierFixed deployed to:", tokenQualifierAddress);
    
    // Step 2: Deploy ProfileNFTFixed
    console.log("\n📦 Deploying ProfileNFTFixed...");
    const ProfileNFTFixed = await ethers.getContractFactory("ProfileNFTFixed");
    const profileNFT = await ProfileNFTFixed.deploy(
        "ImmutableType Profile",
        "ITP",
        tokenQualifierAddress
    );
    await profileNFT.waitForDeployment();
    const profileNFTAddress = await profileNFT.getAddress();
    
    console.log("✅ ProfileNFTFixed deployed to:", profileNFTAddress);
    
    // Step 3: Configure BUFFAFLOW Token
    console.log("\n🔧 Configuring BUFFAFLOW token qualification...");
    const BUFFAFLOW_ADDRESS = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
    const MIN_BUFFAFLOW_BALANCE = ethers.parseEther("100");
    
    const addTokenTx = await tokenQualifier.addQualifyingToken(
        0, // TIER_BASIC
        BUFFAFLOW_ADDRESS,
        MIN_BUFFAFLOW_BALANCE
    );
    await addTokenTx.wait();
    
    console.log("✅ BUFFAFLOW configured as qualifying token");
    
    // Step 4: Transfer ownership to treasury
    console.log("\n�� Transferring TokenQualifier ownership to treasury...");
    const transferOwnership = await tokenQualifier.transferOwnership(TREASURY_WALLET);
    await transferOwnership.wait();
    
    console.log("✅ TokenQualifier ownership transferred to treasury");
    
    // Step 5: Grant admin role to treasury
    console.log("\n🔧 Granting admin permissions to treasury...");
    const DEFAULT_ADMIN_ROLE = await profileNFT.DEFAULT_ADMIN_ROLE();
    const grantTreasuryRole = await profileNFT.grantRole(DEFAULT_ADMIN_ROLE, TREASURY_WALLET);
    await grantTreasuryRole.wait();
    
    console.log("✅ Treasury wallet granted admin permissions");
    
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("📋 NEW CONTRACT ADDRESSES:");
    console.log("TokenQualifierFixed:", tokenQualifierAddress);
    console.log("ProfileNFTFixed:", profileNFTAddress);
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
