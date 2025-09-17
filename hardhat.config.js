require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    flowEvmMainnet: {
      url: "https://mainnet.evm.nodes.onflow.org",
      chainId: 747,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};