async function main() {
    console.log("Testing ethers availability...");
    
    // Try different ways to access ethers
    try {
        const hardhat = require("hardhat");
        console.log("hardhat object keys:", Object.keys(hardhat));
        
        if (hardhat.ethers) {
            console.log("Found hardhat.ethers");
            const signers = await hardhat.ethers.getSigners();
            console.log("Signers found:", signers.length);
        } else {
            console.log("hardhat.ethers not found");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main().catch(console.error);