const hre = require("hardhat");

async function main() {
  const TOURNAMENT = '0xEbeb586f068DD5fbB745d6df8C3C51810a2C18Cb';
  
  const tournament = await hre.ethers.getContractAt(
    "FrothComicTournamentV3",
    TOURNAMENT
  );
  
  console.log('Attempting to finalize Day 366...');
  
  const tx = await tournament.finalizeDay(366);
  console.log('Transaction submitted:', tx.hash);
  
  await tx.wait();
  console.log('✅ Day 366 finalized!');
  console.log('\nNow run: node check-day-366-winner.js');
}

main().catch(console.error);
