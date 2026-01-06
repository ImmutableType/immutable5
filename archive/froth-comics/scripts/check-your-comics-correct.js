const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  const YOUR_ADDRESS = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';
  const COMIC_NFT = '0x75b32e83C7063ABC40c7a494A95eB0047E6aA1b7';
  const TOURNAMENT = '0xEbeb586f068DD5fbB745d6df8C3C51810a2C18Cb';
  
  const comicAbi = [
    "function totalSupply() view returns (uint256)",
    "function getComic(uint256) view returns (address,uint256,uint256,uint256[],uint256,uint256,uint256[][])"
  ];
  
  const tournamentAbi = [
    "function comicVotes(uint256) view returns (uint256)"
  ];
  
  const comicNFT = new ethers.Contract(COMIC_NFT, comicAbi, provider);
  const tournament = new ethers.Contract(TOURNAMENT, tournamentAbi, provider);
  
  console.log('Scanning all comics for yours...');
  const totalSupply = await comicNFT.totalSupply();
  console.log('Total comics on platform:', totalSupply.toString());
  
  console.log('\nYour comics:');
  let yourComicCount = 0;
  
  for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
    try {
      const comic = await comicNFT.getComic(tokenId);
      
      if (comic[0].toLowerCase() === YOUR_ADDRESS.toLowerCase()) {
        yourComicCount++;
        const votes = await tournament.comicVotes(tokenId);
        console.log(`\n  Token #${tokenId}:`);
        console.log(`    Day: ${comic[1].toString()}`);
        console.log(`    Created: ${new Date(Number(comic[2]) * 1000).toLocaleString()}`);
        console.log(`    Votes: ${ethers.formatEther(votes)} BUFFAFLOW`);
      }
    } catch (err) {
      // Skip invalid token IDs
    }
  }
  
  console.log(`\n\nTotal: You created ${yourComicCount} comics`);
}

main().catch(console.error);
