const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');
  const YOUR_ADDRESS = '0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2';
  const COMIC_NFT = '0x75b32e83C7063ABC40c7a494A95eB0047E6aA1b7';
  
  const comicAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)",
    "function getComic(uint256) view returns (address,uint256,uint256,uint256[],uint256,uint256,uint256[][])",
    "function totalSupply() view returns (uint256)"
  ];
  
  const comicNFT = new ethers.Contract(COMIC_NFT, comicAbi, provider);
  
  console.log('Checking your ComicNFTs...');
  console.log('Your address:', YOUR_ADDRESS);
  console.log('ComicNFT contract:', COMIC_NFT);
  
  const balance = await comicNFT.balanceOf(YOUR_ADDRESS);
  console.log('\nYou own', balance.toString(), 'ComicNFTs');
  
  if (balance > 0) {
    console.log('\nYour comics:');
    for (let i = 0; i < balance; i++) {
      const tokenId = await comicNFT.tokenOfOwnerByIndex(YOUR_ADDRESS, i);
      const comic = await comicNFT.getComic(tokenId);
      console.log(`\n  Token #${tokenId}:`);
      console.log(`    Day: ${comic[1].toString()}`);
      console.log(`    Created: ${new Date(Number(comic[2]) * 1000).toLocaleString()}`);
    }
  }
  
  const totalSupply = await comicNFT.totalSupply();
  console.log('\n\nTotal comics minted on platform:', totalSupply.toString());
}

main().catch(console.error);
