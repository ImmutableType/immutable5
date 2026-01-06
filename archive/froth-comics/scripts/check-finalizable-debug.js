const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  const YOUR_ADDRESS = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';
  const TOURNAMENT = '0xEbeb586f068DD5fbB745d6df8C3C51810a2C18Cb';
  const COMIC_NFT = '0x75b32e83C7063ABC40c7a494A95eB0047E6aA1b7';
  
  const tournamentAbi = [
    "function getCurrentDay() view returns (uint256)",
    "function getDayInfo(uint256) view returns (uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,bool,uint256)",
    "function hasEntered(uint256, address) view returns (bool)",
    "function getEntryCount(uint256, address) view returns (uint256)"
  ];
  
  const comicAbi = [
    "function getUserComicsForDay(uint256, address) view returns (uint256)"
  ];
  
  const tournament = new ethers.Contract(TOURNAMENT, tournamentAbi, provider);
  const comicNFT = new ethers.Contract(COMIC_NFT, comicAbi, provider);
  
  const currentDay = await tournament.getCurrentDay();
  console.log('Current Day:', currentDay.toString());
  console.log('\nChecking last 30 days for finalizable tournaments...\n');
  
  const finalizableDays = [];
  
  for (let day = Math.max(0, Number(currentDay) - 30); day < currentDay; day++) {
    const info = await tournament.getDayInfo(day);
    const submissionOpen = info[6];
    const votingOpen = info[7];
    const finalized = info[8];
    
    // Day must be closed but not finalized
    if (!submissionOpen && !votingOpen && !finalized) {
      // Check if user has comics
      const comicCount = await comicNFT.getUserComicsForDay(day, YOUR_ADDRESS);
      
      if (Number(comicCount) > 0) {
        console.log(`✅ Day ${day}: ${comicCount} comics - NEEDS FINALIZATION`);
        finalizableDays.push({ day, comicCount: Number(comicCount) });
      }
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Finalizable days:', finalizableDays.length);
  if (finalizableDays.length > 0) {
    console.log('Days:', finalizableDays.map(d => `Day ${d.day} (${d.comicCount} comics)`).join(', '));
  } else {
    console.log('No days need finalization where you have comics');
  }
}

main().catch(console.error);
