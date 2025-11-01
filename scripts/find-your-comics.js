const hre = require("hardhat");

async function main() {
  const YOUR_ADDRESS = "0x9402F9f20b4a27b55B1cC6cf015D98f764814fb2";
  
  console.log("Checking NEW ComicNFT...");
  const newComicNFT = await hre.ethers.getContractAt(
    "ComicNFT",
    "0x7AA01C6E9CF61751FFbED7aEA8d656ad5bE526d6"
  );
  
  const totalSupply = await newComicNFT.totalSupply();
  console.log("Total comics on NEW contract:", totalSupply.toString());
  
  let yourComics = [];
  for (let i = 1; i <= Number(totalSupply); i++) {
    const owner = await newComicNFT.ownerOf(i);
    if (owner.toLowerCase() === YOUR_ADDRESS.toLowerCase()) {
      const comic = await newComicNFT.getComic(i);
      yourComics.push({ tokenId: i, dayId: comic.dayId.toString() });
    }
  }
  
  console.log("\nYour comics on NEW contract:", yourComics);
  
  if (yourComics.length > 0) {
    console.log("\nChecking tournament entries for these days...");
    const newTournament = await hre.ethers.getContractAt(
      "FrothComicTournamentV2",
      "0x57AA4E1B146C675c446310b4Ff92ed9e6E5c10FC"
    );
    
    for (const comic of yourComics) {
      const hasEntered = await newTournament.hasEntered(comic.dayId, YOUR_ADDRESS);
      console.log(`Day ${comic.dayId}: Entered = ${hasEntered}`);
    }
  }
}

main().catch(console.error);
