require('dotenv').config({ path: '.env.local' });

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
        flowTestnet: {
            url: "https://testnet.evm.nodes.onflow.org",
            chainId: 545,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            gasPrice: "auto"
        }
    },
    etherscan: {
        apiKey: {
            flowTestnet: "abc"
        },
        customChains: [
            {
                network: "flowTestnet",
                chainId: 545,
                urls: {
                    apiURL: "https://evm-testnet.flowscan.io/api",
                    browserURL: "https://evm-testnet.flowscan.io"
                }
            }
        ]
    }
};