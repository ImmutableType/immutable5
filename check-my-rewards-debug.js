const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  const YOUR_ADDRESS = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';
  const TOURNAMENT = '0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC';
  
  const abi = [
    "function getCurrentDay() view returns (uint256)",
    "function getDayInfo(uint256) view returns (uint256,uint256,uint256,uint256,uint256,uint256,bool,bool,bool,uint256)",
    "function getCreatorReward(uint256, address) view returns (uint256)",
    "function getVoterReward(uint256, address) view returns (uint256)",
    "function hasEntered(uint256, address) view returns (bool)"
  ];
  
  const tournament = new ethers.Contract(TOURNAMENT, abi, provider);
  
  const currentDay = await tournament.getCurrentDay();
  console.log('Current Day:', currentDay.toString());
  
  // Check last 5 days
  for (let day = Math.max(0, Number(currentDay) - 5); day < currentDay; day++) {
    console.log(`\n=== Day ${day} ===`);
    const info = await tournament.getDayInfo(day);
    console.log('Finalized:', info[8]);
    console.log('Creator Pool:', ethers.formatEther(info[3]), 'FROTH');
    console.log('Voter Pool:', ethers.formatEther(info[4]), 'FROTH');
    
    if (info[8]) { // If finalized
      const entered = await tournament.hasEntered(day, YOUR_ADDRESS);
      console.log('You entered:', entered);
      
      const creatorReward = await tournament.getCreatorReward(day, YOUR_ADDRESS);
      const voterReward = await tournament.getVoterReward(day, YOUR_ADDRESS);
      console.log('Your Creator Reward:', ethers.formatEther(creatorReward), 'FROTH');
      console.log('Your Voter Reward:', ethers.formatEther(voterReward), 'FROTH');
    }
  }
}

main().catch(console.error);
