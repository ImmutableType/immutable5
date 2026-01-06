const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying FrothComicDaily to Flow EVM Mainnet...");

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Contract addresses
  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  const BUFFAFLOW_TOKEN = "0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798";
  const TREASURY_WALLET = "0x85c0449121BfAA4F9009658B35aCFa0FEC62d168";
  const PROFILE_NFT = "0xDb742cD47D09Cf7e6f22F24289449C672Ef77934";

  console.log("\nContract Parameters:");
  console.log("FROTH Token:", FROTH_TOKEN);
  console.log("BUFFAFLOW Token:", BUFFAFLOW_TOKEN);
  console.log("Treasury Wallet:", TREASURY_WALLET);
  console.log("ProfileNFT:", PROFILE_NFT);

  // Verify ProfileNFT exists
  try {
    const profileNFTCode = await ethers.provider.getCode(PROFILE_NFT);
    if (profileNFTCode === "0x") {
      console.error("ERROR: ProfileNFT contract not found at address!");
      process.exit(1);
    }
    console.log("✓ ProfileNFT contract verified");
  } catch (error) {
    console.error("Error checking ProfileNFT:", error.message);
    process.exit(1);
  }

  try {
    console.log("\nDeploying proxy...");
    const FrothComicDaily = await ethers.getContractFactory("FrothComicDaily");
    
    const proxy = await upgrades.deployProxy(
      FrothComicDaily,
      [FROTH_TOKEN, BUFFAFLOW_TOKEN, TREASURY_WALLET, PROFILE_NFT],
      { 
        initializer: "initialize", 
        kind: "uups",
        timeout: 0
      }
    );

    // Wait for deployment (ethers v6 syntax)
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    console.log("\n✅ FrothComicDaily deployed to:", proxyAddress);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("Implementation at:", implementationAddress);
    
    console.log("\n⚠️  CRITICAL NEXT STEPS:");
    console.log("\n1. LATER - Treasury must approve contract for FROTH transfers:");
    console.log(`   (From treasury wallet: ${TREASURY_WALLET})`);
    console.log(`   frothToken.approve("${proxyAddress}", ethers.MaxUint256);`);
    
    console.log("\n2. LATER - Manually seed Day 0 when ready:");
    console.log(`   contract.manualSeedDay(0, ethers.parseEther("1000"));`);
    
    console.log("\n3. Add contract address to frontend .env:");
    console.log(`   NEXT_PUBLIC_FROTH_COMIC_ADDRESS=${proxyAddress}`);
    
    console.log("\n4. Verify contract on FlowScan:");
    console.log(`   npx hardhat verify --network flowMainnet ${proxyAddress}`);

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error("Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.transaction) {
      console.error("Transaction:", error.transaction);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });