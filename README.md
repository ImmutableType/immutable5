# ImmutableType - Decentralized Journalism Platform

A decentralized journalism platform built on **Flow EVM Mainnet** that enables immutable, transferable identity verification for journalists and readers. The platform features on-chain content creation, source verification, and community-driven news economics.

**Production URL**: https://app.immutabletype.com  
**Built on**: Flow EVM Mainnet (Chain ID: 747)

---

## What This Project Does

ImmutableType is a full-stack Web3 application that combines:

1. **Profile NFTs** - Tiered, transferable identity verification system
2. **Bookmark Collection** - On-chain source verification and bookmark NFT minting
3. **Multi-Token Economy** - Integration with FLOW and BUFFAFLOW tokens

The platform uses smart contracts (Solidity) for on-chain logic and a Next.js frontend for user interaction, all deployed on Flow EVM for low gas costs and EVM compatibility.

---

## Key Features

- **Tiered Profile NFTs**: Progressive verification system with multi-token gating (FLOW or BUFFAFLOW)
- **On-Chain Bookmarks**: Mint bookmark NFTs with daily limits for source verification
- **Multi-Token Support**: FLOW for payments, BUFFAFLOW for voting/fee bypass

---

## Prerequisites

- **Node.js** 18+ and npm
- **Wallet Extension** (MetaMask or Flow Wallet)
- **Flow EVM Network** configured in your wallet:
  - Network Name: Flow EVM Mainnet
  - RPC URL: `https://mainnet.evm.nodes.onflow.org`
  - Chain ID: `747`
  - Currency Symbol: FLOW
  - Block Explorer: `https://evm.flowscan.io`

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Immutable_5
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Contract Addresses (Mainnet)
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0xDb742cD47D09Cf7e6f22F24289449C672Ef77934
NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS=0xa27e2A0280127cf827876a4795d551865F930687
NEXT_PUBLIC_BOOKMARK_NFT_ADDRESS=0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5
NEXT_PUBLIC_BUFFAFLOW_ADDRESS=0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798
NEXT_PUBLIC_TREASURY_ADDRESS=0x00000000000000000000000228B74E66CBD624Fc

# Network Configuration
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=747
NEXT_PUBLIC_FLOW_EVM_RPC_URL=https://mainnet.evm.nodes.onflow.org
```

**Note**: These are the production mainnet addresses. The app connects to Flow EVM Mainnet by default. For local contract development, you'll need to deploy contracts to a local Hardhat network and update these addresses accordingly.

### 4. Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 5. Connect Your Wallet

1. Open the app in your browser
2. Click "Connect Wallet" to connect MetaMask
3. Ensure MetaMask is configured with Flow EVM Mainnet (see Prerequisites)

---

## Project Structure

```
Immutable_5/
├── app/                      # Next.js application
│   ├── (client)/            # Client-side routes
│   │   ├── profile/         # Profile creation/viewing pages
│   │   ├── reader/          # Reader interface
│   │   └── page.tsx         # Homepage (routes to profile)
│   ├── components/          # React components
│   │   ├── features/        # Feature-specific components
│   │   ├── layout/          # Layout components (Navigation, etc.)
│   │   └── ui/              # Reusable UI components
│   └── layout.tsx           # Root layout
│
├── contracts/               # Smart contracts (Solidity)
│   ├── ProfileNFTFixed.sol
│   ├── BookmarkNFT.sol
│   └── interfaces/          # Contract interfaces
│
├── lib/                     # Library code
│   ├── services/            # Service layer (contract interactions)
│   │   ├── profile/         # ProfileNFT service
│   │   └── bookmark/        # BookmarkNFT service
│   ├── hooks/               # React hooks (useDirectWallet, etc.)
│   ├── web3/                # Web3 configuration
│   └── types/               # TypeScript type definitions
│
├── scripts/                 # Deployment and utility scripts
│   ├── deploy-*.js          # Contract deployment scripts
│   ├── check-*.js           # Monitoring/checking scripts
│   └── configure-*.js       # Configuration scripts
│
├── docs/                    # Documentation
│   └── architecture.md      # System architecture
│
├── archive/                 # Archived features
│   └── froth-comics/       # Archived FROTH Comics feature
│
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## Smart Contract Development

If you want to work with the smart contracts locally:

1. **Install Hardhat dependencies** (already included)
2. **Configure Hardhat** - Edit `hardhat.config.js` for local network settings
3. **Deploy contracts locally** - Use scripts in `/scripts` directory
4. **Update environment variables** - Point to local contract addresses

Example deployment:
```bash
npx hardhat run scripts/deploy-profile.js --network localhost
```

---

## Troubleshooting

### Wallet Connection Issues

- **MetaMask not connecting**: Ensure MetaMask is installed and unlocked
- **Wrong network**: Verify Flow EVM Mainnet is added and selected in MetaMask
- **Connection timeout**: Check that the RPC URL in environment variables is correct

### Contract Interaction Issues

- **"Contract not found"**: Verify contract addresses in `.env.local` match deployed contracts
- **Transaction failures**: Ensure you have sufficient FLOW tokens for gas
- **"Insufficient balance"**: Check token balances (FLOW for gas, BUFFAFLOW for features)

### Development Server Issues

- **Port 3000 already in use**: Change the port with `npm run dev -- -p 3001`
- **Build errors**: Delete `.next` folder and `node_modules`, then run `npm install` again
- **TypeScript errors**: Run `npm run lint` to see detailed error messages

---

## Key Files to Understand

1. **`app/(client)/page.tsx`** - Main homepage routing logic
2. **`lib/services/profile/ProfileNFT.ts`** - Profile NFT service layer
3. **`lib/services/bookmark/BookmarkNFT.ts`** - Bookmark NFT service layer
4. **`lib/hooks/useDirectWallet.ts`** - Wallet connection hook
5. **`lib/web3/contracts.ts`** - Contract address configuration

---

## Network Information

- **Blockchain**: Flow EVM Mainnet
- **Chain ID**: 747
- **RPC Endpoint**: https://mainnet.evm.nodes.onflow.org
- **Block Explorer**: https://evm.flowscan.io
- **Currency**: FLOW

---

## Documentation

- [Architecture Documentation](docs/architecture.md) - Detailed system architecture

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Submit a pull request

---

## License

MIT License

---

## Support

- **Production Platform**: https://app.immutabletype.com
- **Twitter**: [@Immutable_type](https://twitter.com/Immutable_type)
- **GitHub**: https://github.com/ImmutableType/immutable5

---

**Built on Flow EVM Mainnet | Chain ID: 747**

*Restoring trust in local journalism through immutable on-chain identity and source verification.*
