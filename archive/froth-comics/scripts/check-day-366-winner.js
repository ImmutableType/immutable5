const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  const YOUR_ADDRESS = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';
  const TOURNAMENT = '0xEbeb586f068DD5fbB745d6df8C3C51810a2C18Cb';
  
  const abi = [
    "function getDayInfo(uint256) view returns (uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,bool,uint256)",
    "function getDayWinners(uint256) view returns (tuple(address creator, uint256 tokenId, uint256 reward, uint256 rank)[])",
    "function getCreatorReward(uint256, address) view returns (uint256)",
    "function getVoterReward(uint256, address) view returns (uint256)"
  ];
  
  const tournament = new ethers.Contract(TOURNAMENT, abi, provider);
  
  console.log('=== DAY 366 STATUS ===\n');
  
  const info = await tournament.getDayInfo(366);
  console.log('Finalized:', info[8]);
  console.log('Creator Pool:', ethers.formatEther(info[3]), 'FROTH');
  console.log('Voter Pool:', ethers.formatEther(info[4]), 'FROTH');
  
  if (!info[8]) {
    console.log('\n❌ Day 366 is NOT finalized yet - no rewards available');
    console.log('Submission open:', info[6]);
    console.log('Voting open:', info[7]);
    return;
  }
  
  console.log('\n✅ Day 366 is FINALIZED\n');
  
  try {
    const winners = await tournament.getDayWinners(366);
    console.log('Winner:');
    console.log('  Token ID:', winners[0].tokenId.toString());
    console.log('  Creator:', winners[0].creator);
    console.log('  Reward:', ethers.formatEther(winners[0].reward), 'FROTH');
    
    const isYou = winners[0].creator.toLowerCase() === YOUR_ADDRESS.toLowerCase();
    console.log(`\n${isYou ? '�� YOU WON!' : '❌ You did not win'}`);
    
    if (isYou) {
      console.log('\nYour winning comic was Token #' + winners[0].tokenId.toString());
    } else {
      console.log('\nWinner was Token #' + winners[0].tokenId.toString());
      console.log('Your comics were: #1, #2, #3');
    }
    
    const creatorReward = await tournament.getCreatorReward(366, YOUR_ADDRESS);
    const voterReward = await tournament.getVoterReward(366, YOUR_ADDRESS);
    
    console.log('\n=== YOUR CLAIMABLE REWARDS ===');
    console.log('Creator Reward:', ethers.formatEther(creatorReward), 'FROTH');
    console.log('Voter Reward:', ethers.formatEther(voterReward), 'FROTH');
    
  } catch (err) {
    console.log('⚠️  Error getting winner - finalization may have failed');
    console.log(err.message);
  }
}

main().catch(console.error);
