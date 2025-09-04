const hardhat = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("Deploying ProfileNFT system to Flow EVM Testnet...");
    
    const [deployer] = await hardhat.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await hardhat.ethers.provider.getBalance(deployer.address)).toString());
    
    // Deploy TokenQualifier first
    console.log("\n1. Deploying TokenQualifier...");
    const TokenQualifier = await hardhat.ethers.getContractFactory("TokenQualifier");
    const tokenQualifier = await TokenQualifier.deploy();
    await tokenQualifier.waitForDeployment();
    console.log("TokenQualifier deployed to:", await tokenQualifier.getAddress());
    
    // Deploy ProfileNFT
    console.log("\n2. Deploying ProfileNFT...");
    const ProfileNFT = await hardhat.ethers.getContractFactory("ProfileNFT");
    const profileNFT = await ProfileNFT.deploy(
        "ImmutableType Profiles",
        "ITP",
        await tokenQualifier.getAddress()
    );
    await profileNFT.waitForDeployment();
    console.log("ProfileNFT deployed to:", await profileNFT.getAddress());
    
    // Save deployment info
    const deploymentInfo = {
        network: "Flow EVM Testnet",
        chainId: 545,
        timestamp: new Date().toISOString(),
        contracts: {
            TokenQualifier: await tokenQualifier.getAddress(),
            ProfileNFT: await profileNFT.getAddress()
        },
        deployer: deployer.address
    };
    
    console.log("\n=== Deployment Complete ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Save to file
    fs.writeFileSync(
        './deployments/ProfileNFT.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\nDeployment info saved to ./deployments/ProfileNFT.json");
}

main().catch(console.error);