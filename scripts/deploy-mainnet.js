// scripts/deploy-mainnet.js
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
    
    // Step 1: Deploy TokenQualifier
    console.log("📦 Deploying TokenQualifier...");
    const TokenQualifier = await ethers.getContractFactory("TokenQualifier");
    const tokenQualifier = await TokenQualifier.deploy();
    await tokenQualifier.waitForDeployment();
    const tokenQualifierAddress = await tokenQualifier.getAddress();
    
    console.log("✅ TokenQualifier deployed to:", tokenQualifierAddress);
    
    // Step 2: Deploy ProfileNFT
    console.log("\n📦 Deploying ProfileNFT...");
    const ProfileNFT = await ethers.getContractFactory("ProfileNFT");
    const profileNFT = await ProfileNFT.deploy(
        "ImmutableType Profile",
        "ITP",
        tokenQualifierAddress
    );
    await profileNFT.waitForDeployment();
    const profileNFTAddress = await profileNFT.getAddress();
    
    console.log("✅ ProfileNFT deployed to:", profileNFTAddress);
    
    // Step 3: Configure Treasury Permissions
    console.log("\n🔧 Configuring treasury permissions...");
    
    // Grant admin role to treasury wallet
    const DEFAULT_ADMIN_ROLE = await profileNFT.DEFAULT_ADMIN_ROLE();
    const grantTreasuryRole = await profileNFT.grantRole(DEFAULT_ADMIN_ROLE, TREASURY_WALLET);
    await grantTreasuryRole.wait();
    
    console.log("✅ Treasury wallet granted admin permissions:", TREASURY_WALLET);
    
    // Step 4: Configure BUFFAFLOW Token
    console.log("\n🔧 Configuring BUFFAFLOW token qualification...");
    const BUFFAFLOW_ADDRESS = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
    const MIN_BUFFAFLOW_BALANCE = ethers.parseEther("100"); // 100 tokens
    
    const addTokenTx = await tokenQualifier.addQualifyingToken(
        0, // TIER_BASIC
        BUFFAFLOW_ADDRESS,
        MIN_BUFFAFLOW_BALANCE
    );
    await addTokenTx.wait();
    
    console.log("✅ BUFFAFLOW configured as qualifying token");
    console.log("   - Minimum balance: 100 BUFFAFLOW");
    console.log("   - Tier: 0 (Basic Profile Creation)");
    
    // Step 5: Transfer TokenQualifier ownership to treasury
    console.log("\n🔧 Transferring TokenQualifier ownership to treasury...");
    const transferOwnership = await tokenQualifier.transferOwnership(TREASURY_WALLET);
    await transferOwnership.wait();
    
    console.log("✅ TokenQualifier ownership transferred to treasury");
    
    // Step 6: Verify Configuration
    console.log("\n🔍 Verifying deployment...");
    const basicFee = await profileNFT.getBasicProfileFee();
    const hasQualifyingTokens = await tokenQualifier.hasQualifyingTokens(deployer.address, 0);
    
    console.log("✅ Basic Profile Fee:", ethers.formatEther(basicFee), "FLOW");
    console.log("✅ Deployer has qualifying tokens:", hasQualifyingTokens);
    
    // Step 7: Create deployment record
    const deploymentRecord = {
        network: "Flow EVM Mainnet",
        chainId: 747,
        timestamp: new Date().toISOString(),
        contracts: {
            TokenQualifier: tokenQualifierAddress,
            ProfileNFT: profileNFTAddress
        },
        configuration: {
            basicProfileFee: "3 FLOW",
            buffaflowAddress: BUFFAFLOW_ADDRESS,
            minBuffaflowBalance: "100 tokens",
            treasuryWallet: TREASURY_WALLET
        },
        deployer: deployer.address,
        gasUsed: "~2,500,000 gas units"
    };
    
    console.log("\n📋 DEPLOYMENT SUMMARY");
    console.log("=====================");
    console.log("🌐 Network: Flow EVM Mainnet");
    console.log("🔗 Chain ID: 747");
    console.log("📅 Timestamp:", deploymentRecord.timestamp);
    console.log("🔑 Deployer:", deployer.address);
    console.log("🏦 Treasury:", TREASURY_WALLET);
    console.log("\n📜 CONTRACT ADDRESSES");
    console.log("TokenQualifier:", tokenQualifierAddress);
    console.log("ProfileNFT:", profileNFTAddress);
    console.log("\n⚙️ CONFIGURATION");
    console.log("Basic Profile Fee: 3 FLOW");
    console.log("BUFFAFLOW Address:", BUFFAFLOW_ADDRESS);
    console.log("Min BUFFAFLOW Balance: 100 tokens");
    console.log("Treasury Wallet:", TREASURY_WALLET);
    
    return deploymentRecord;
}

main()
    .then((deploymentRecord) => {
        console.log("\n🎉 DEPLOYMENT COMPLETE!");
        console.log("Save these addresses for frontend configuration:");
        console.log("TokenQualifier:", deploymentRecord.contracts.TokenQualifier);
        console.log("ProfileNFT:", deploymentRecord.contracts.ProfileNFT);
        console.log("Treasury Wallet:", deploymentRecord.configuration.treasuryWallet);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });