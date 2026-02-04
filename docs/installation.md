# Installation & Setup Guide

Complete installation and setup instructions for ImmutableType.

## Prerequisites

### Required Software

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (comes with Node.js)
- **Git** for version control

### Verify Installation

```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
git --version   # Any recent version
```

### Browser Requirements

- **Chrome** 90+ (recommended)
- **Firefox** 88+
- **Edge** 90+
- **Safari** 14+ (with limitations)

### Wallet Extensions

Install at least one of:
- [MetaMask](https://metamask.io) - Recommended
- [Flow EVM Wallet](https://flow.com/wallet) - Flow native wallet

**Important**: This app requires **Flow EVM** wallets (Ethereum-compatible), NOT Cadence/native Flow wallets.

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/ImmutableType/immutable5.git
cd immutable5
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15.5.9
- React 19.1.0
- ethers.js 6.15.0
- MetaMask SDK
- TypeScript
- And all other dependencies

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Contract Addresses (Flow EVM Mainnet)
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0xDb742cD47D09Cf7e6f22F24289449C672Ef77934
NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS=0xa27e2A0280127cf827876a4795d551865F930687
NEXT_PUBLIC_BOOKMARK_NFT_ADDRESS=0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5
NEXT_PUBLIC_BUFFAFLOW_ADDRESS=0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798
NEXT_PUBLIC_TREASURY_ADDRESS=0x00000000000000000000228B74E66CBD624Fc

# Network Configuration
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=747
NEXT_PUBLIC_FLOW_EVM_RPC_URL=https://mainnet.evm.nodes.onflow.org
NEXT_PUBLIC_ENVIRONMENT=mainnet
```

**Note**: These are production mainnet addresses. For local development with contracts, see [Development Guide](./development.md).

### 4. Configure Your Wallet

#### MetaMask Setup

1. Install [MetaMask extension](https://metamask.io)
2. Create or import a wallet
3. Add Flow EVM Mainnet:
   - Click network dropdown → "Add Network"
   - Or use "Add Network Manually"
   - Enter:
     - **Network Name**: Flow EVM Mainnet
     - **RPC URL**: `https://mainnet.evm.nodes.onflow.org`
     - **Chain ID**: `747`
     - **Currency Symbol**: FLOW
     - **Block Explorer**: `https://evm.flowscan.io`

#### Flow EVM Wallet Setup

1. Install [Flow Wallet extension](https://flow.com/wallet)
2. Create or import a wallet
3. Ensure it's configured for Flow EVM (not Cadence)
4. The app will automatically detect it via EIP-6963

### 5. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 6. Verify Installation

1. Open `http://localhost:3000` in your browser
2. Click "Connect Wallet"
3. Select your wallet (MetaMask or Flow Wallet)
4. Approve connection
5. You should see your wallet address in the navigation

## Troubleshooting Installation

### npm install Fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
npm install --legacy-peer-deps
```

### Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```

Or kill the process using port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### TypeScript Errors

**Error**: Type errors during build

**Solution**:
```bash
# Check TypeScript version
npx tsc --version

# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Module Not Found Errors

**Error**: `Cannot find module`

**Solution**:
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run dev
```

## Next Steps

After successful installation:

1. Read the [Getting Started Guide](./getting-started.md)
2. Review the [Architecture Documentation](./architecture.md)
3. Explore the [Wallet Integration Guide](./wallet-integration.md)
4. Check out [Smart Contracts Documentation](./smart-contracts.md)

## Development vs Production

### Development Mode

- Uses `.env.local` for environment variables
- Hot reload enabled
- Detailed error messages
- Source maps enabled

### Production Mode

- Uses `.env.production` for environment variables
- Optimized builds
- Minified code
- No source maps

## Additional Resources

- [Node.js Installation Guide](https://nodejs.org/en/download/)
- [MetaMask Setup Guide](https://metamask.io/download/)
- [Flow EVM Documentation](https://docs.onflow.org/evm/)
