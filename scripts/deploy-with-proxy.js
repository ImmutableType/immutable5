// scripts/deploy-with-proxy.js
const { ethers, upgrades } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('🚀 Deploying FrothComicDaily with Proxy Pattern...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'FLOW\n');

  // Contract addresses for initialization
  const FROTH_TOKEN = '0xB73BF8e6A4477a952E0338e6CC00cC0ce5AD04bA';
  const BUFFAFLOW_TOKEN = '0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798';
  const PROFILE_NFT = '0xDb742cD47D09Cf7e6f22F24289449C672Ef77934';
  const TREASURY = '0x85c0449121BfAA4F9009658B35aCFa0FEC62d168';

  console.log('📝 Contract Configuration:');
  console.log('FROTH Token:', FROTH_TOKEN);
  console.log('BUFFAFLOW Token:', BUFFAFLOW_TOKEN);
  console.log('ProfileNFT:', PROFILE_NFT);
  console.log('Treasury:', TREASURY);
  console.log('');

  // Deploy proxy + implementation in one step
  console.log('📦 Deploying FrothComicDaily with proxy...');
  const FrothComicDaily = await ethers.getContractFactory('FrothComicDaily');
  
  const proxy = await upgrades.deployProxy(
    FrothComicDaily,
    [FROTH_TOKEN, BUFFAFLOW_TOKEN, TREASURY, PROFILE_NFT],
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();

  console.log('✅ Proxy deployed to:', proxyAddress);
  console.log('🔗 https://evm.flowscan.io/address/' + proxyAddress);
  
  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log('📚 Implementation at:', implementationAddress);
  console.log('');

  // Verify initialization worked
  console.log('🔍 Verifying initialization...');
  const owner = await proxy.owner();
  const frothToken = await proxy.frothToken();
  
  console.log('Owner:', owner);
  console.log('FROTH Token:', frothToken);
  console.log('✅ Contract initialized successfully!\n');

  // Initialize Day 0
  console.log('🎨 Initializing Day 0...');
  
  const openTime = Math.floor(Date.now() / 1000);
  const closeTime = Math.floor(new Date('2025-10-23T00:00:00Z').getTime() / 1000);

  console.log('Open Time:', new Date(openTime * 1000).toUTCString());
  console.log('Close Time:', new Date(closeTime * 1000).toUTCString());
  console.log('  (8:00 PM Miami, Oct 22)');

  const tx = await proxy.initializeDay(
    7,  // Froth R
    12, // QWERTY
    6,  // Mask R
    10, // Buff L
    0,  // West background
    openTime,
    closeTime
  );

  await tx.wait();
  console.log('✅ Day 0 initialized!\n');

  const currentDay = await proxy.getCurrentDay();
  console.log('Current day:', currentDay.toString());

  const template = await proxy.getDailyTemplate(0);
  console.log('\n📊 Day 0 Template:');
  console.log('Characters:', template[0].map(n => Number(n)));
  console.log('Background:', Number(template[1]));
  console.log('Creator Pool:', ethers.formatEther(template[4]), 'FROTH');
  console.log('Voter Pool:', ethers.formatEther(template[5]), 'FROTH');

  console.log('\n✅ Deployment complete!');
  console.log('\n📋 UPDATE YOUR RAILWAY ENV VAR:');
  console.log('NEXT_PUBLIC_FROTH_COMIC_ADDRESS=' + proxyAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });