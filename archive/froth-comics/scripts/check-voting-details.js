const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  const YOUR_ADDRESS = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';
  const TOURNAMENT = '0xEbeb586f068DD5fbB745d6df8C3C51810a2C18Cb';  // V3 CORRECT
  const COMIC_NFT = '0x75b32e83C7063ABC40c7a494A95eB0047E6aA1b7';   // V3 CORRECT
  
  const tournamentAbi = [
    "function getCurrentDay() view returns (uint256)",
    "function getDayInfo(uint256) view returns (uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,bool,uint256)",
    "function getDayWinners(uint256) view returns (tuple(address creator, uint256 tokenId, uint256 reward, uint256 rank)[])",
    "function getUserVotesOnComic(uint256, address) view returns (uint256)",
    "function comicVotes(uint256) view returns (uint256)",
    "function hasEntered(uint256, address) view returns (bool)"
  ];
  
  const comicAbi = [
    "function getDayComics(uint256) view returns (uint256[])",
    "function getComic(uint256) view returns (address,uint256,uint256,uint256[],uint256,uint256,uint256[][])"
  ];
  
  const tournament = new ethers.Contract(TOURNAMENT, tournamentAbi, provider);
  const comicNFT = new ethers.Contract(COMIC_NFT, comicAbi, provider);
  
  const currentDay = await tournament.getCurrentDay();
  console.log('Current Day:', currentDay.toString());
  console.log('Using V3 Tournament:', TOURNAMENT);
  console.log('Using V3 ComicNFT:', COMIC_NFT);
  console.log('Checking days 360-368');
  console.log('='.repeat(80));
  
  // Check days 360 to 368
  for (let day = 360; day <= 368; day++) {
    const info = await tournament.getDayInfo(day);
    const finalized = info[8];
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`DAY ${day} - ${finalized ? 'FINALIZED' : 'NOT FINALIZED'}`);
    console.log(`${'='.repeat(80)}`);
    
    const entered = await tournament.hasEntered(day, YOUR_ADDRESS);
    console.log('You entered:', entered);
    console.log('Creator Pool:', ethers.formatEther(info[3]), 'FROTH');
    console.log('Voter Pool:', ethers.formatEther(info[4]), 'FROTH');
    
    if (!finalized) {
      console.log('❌ Day not finalized - no rewards available yet');
      continue;
    }
    
    if (!entered) {
      console.log('❌ You did not enter - no rewards possible');
      continue;
    }
    
    // Try to get winner
    let winners = [];
    try {
      winners = await tournament.getDayWinners(day);
    } catch (err) {
      console.log('⚠️  ERROR: getDayWinners failed - NO WINNER WAS SELECTED!');
      console.log('⚠️  Prize pools are stuck!');
    }
    
    if (winners.length > 0) {
      console.log('\n✅ Winner:');
      console.log('  Creator:', winners[0].creator);
      console.log('  Token ID:', winners[0].tokenId.toString());
      console.log('  Reward:', ethers.formatEther(winners[0].reward), 'FROTH');
      
      const isYouTheWinner = winners[0].creator.toLowerCase() === YOUR_ADDRESS.toLowerCase();
      console.log('  YOU ARE THE WINNER:', isYouTheWinner ? '🎉 YES!' : '❌ No');
      
      const winningVotes = await tournament.comicVotes(winners[0].tokenId);
      console.log('\n  Total votes on winner:', ethers.formatEther(winningVotes), 'BUFFAFLOW');
      
      const yourVotesOnWinner = await tournament.getUserVotesOnComic(winners[0].tokenId, YOUR_ADDRESS);
      console.log('  YOUR votes on winner:', ethers.formatEther(yourVotesOnWinner), 'BUFFAFLOW');
      
      if (Number(yourVotesOnWinner) > 0) {
        console.log('  ✅ You voted on winner - eligible for voter reward!');
      } else {
        console.log('  ❌ You did not vote on winner');
      }
    }
    
    // Check all comics for this day
    try {
      console.log('\nComics submitted on this day:');
      const allComics = await comicNFT.getDayComics(day);
      console.log('  Total comics:', allComics.length);
      
      let yourComicCount = 0;
      for (const tokenId of allComics) {
        const comic = await comicNFT.getComic(tokenId);
        
        if (comic[0].toLowerCase() === YOUR_ADDRESS.toLowerCase()) {
          yourComicCount++;
          const votes = await tournament.comicVotes(tokenId);
          console.log(`  YOUR Comic #${tokenId}: ${ethers.formatEther(votes)} BUFFAFLOW votes`);
        }
      }
      
      if (yourComicCount === 0) {
        console.log('  (You created no comics this day)');
      } else {
        console.log(`  ✅ You created ${yourComicCount} comic(s)`);
      }
    } catch (err) {
      console.log('  Error fetching comics:', err.message);
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('SCAN COMPLETE');
  console.log(`${'='.repeat(80)}`);
}

main().catch(console.error);
