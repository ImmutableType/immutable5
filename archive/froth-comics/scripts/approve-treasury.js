const { ethers } = require("hardhat");

async function main() {
  console.log("Approving FrothComicDaily contract from Treasury wallet...\n");

  const FROTH_TOKEN = "0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA";
  const FROTH_COMIC_CONTRACT = "0x26d04b4a2Af10a569dd49C1A01A4307F1C174DA6";

  // Get signer (should be treasury wallet)
  const [signer] = await ethers.getSigners();
  console.log("Approving from address:", signer.address);
  
  // Verify this is the treasury wallet
  const TREASURY_WALLET = "0x85c0449121BfAA4F9009658B35aCFa0FEC62d168";
  if (signer.address.toLowerCase() !== TREASURY_WALLET.toLowerCase()) {
    console.error("\n❌ ERROR: You must use the treasury wallet!");
    console.error(`Expected: ${TREASURY_WALLET}`);
    console.error(`Got: ${signer.address}`);
    console.error("\nMake sure your .env has the treasury wallet's private key.");
    process.exit(1);
  }

  console.log("✓ Treasury wallet verified\n");

  // Get FROTH token contract
  const frothToken = await ethers.getContractAt("IERC20", FROTH_TOKEN);

  // Check current allowance
  console.log("Checking current allowance...");
  const currentAllowance = await frothToken.allowance(signer.address, FROTH_COMIC_CONTRACT);
  console.log("Current Allowance:", ethers.formatEther(currentAllowance), "FROTH\n");

  // Approve max amount
  console.log("Approving unlimited FROTH spending for FrothComicDaily contract...");
  const tx = await frothToken.approve(FROTH_COMIC_CONTRACT, ethers.MaxUint256);
  console.log("Transaction hash:", tx.hash);
  console.log("View on FlowScan:", `https://evm.flowscan.io/tx/${tx.hash}`);
  
  console.log("\nWaiting for confirmation...");
  await tx.wait();
  
  console.log("\n✅ Approval successful!\n");

  // Verify new allowance
  const newAllowance = await frothToken.allowance(signer.address, FROTH_COMIC_CONTRACT);
  console.log("New Allowance:", ethers.formatEther(newAllowance), "FROTH");
  console.log("(This is effectively unlimited)\n");

  console.log("🎉 Treasury can now seed tournaments!");
  console.log("\n📝 Next steps:");
  console.log("1. Switch your .env PRIVATE_KEY back to deployer wallet");
  console.log("2. Test manual seeding: contract.manualSeedDay(0, ethers.parseEther('100'))");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    if (error.reason) console.error("Reason:", error.reason);
    process.exit(1);
  });