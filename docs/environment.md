# Environment Configuration

Complete guide to environment variables and configuration in ImmutableType.

## Environment Files

### `.env.local` (Development)

Used for local development. Not committed to git.

```bash
# Contract Addresses (Mainnet)
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

### `.env.production` (Production)

Used for production builds. Set in deployment platform (Railway, Vercel, etc.).

Same variables as `.env.local`, but values are set in the deployment platform's environment settings.

## Variable Reference

### Contract Addresses

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_PROFILE_NFT_ADDRESS` | ProfileNFTFixed contract | `0xDb742cD47D09Cf7e6f22F24289449C672Ef77934` |
| `NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS` | TokenQualifierFixed contract | `0xa27e2A0280127cf827876a4795d551865F930687` |
| `NEXT_PUBLIC_BOOKMARK_NFT_ADDRESS` | BookmarkNFT contract | `0x6652801B89f9E3B4a8847Fd0C4F17e7dCd32dFF5` |
| `NEXT_PUBLIC_BUFFAFLOW_ADDRESS` | BUFFAFLOW token contract | `0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798` |
| `NEXT_PUBLIC_TREASURY_ADDRESS` | Treasury wallet address | `0x00000000000000000000228B74E66CBD624Fc` |

### Network Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FLOW_EVM_CHAIN_ID` | Flow EVM chain ID | `747` |
| `NEXT_PUBLIC_FLOW_EVM_RPC_URL` | RPC endpoint URL | `https://mainnet.evm.nodes.onflow.org` |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name | `mainnet` |

## Variable Naming Convention

### NEXT_PUBLIC_ Prefix

All client-accessible variables must be prefixed with `NEXT_PUBLIC_`. This tells Next.js to expose them to the browser.

**Client-accessible:**
```bash
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0x...
```

**Server-only (not used in this project):**
```bash
PRIVATE_KEY=0x...  # Would be server-only
```

## Accessing Variables

### In Client Components

```typescript
const profileAddress = process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS
```

### In Server Components

```typescript
const profileAddress = process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS
```

### In Service Layer

```typescript
// lib/web3/contracts.ts
export const CONTRACTS = {
  PROFILE_NFT: process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS as Address
}
```

## Local Development Setup

### Creating .env.local

1. Copy from example (if exists):
   ```bash
   cp .env.example .env.local
   ```

2. Or create manually:
   ```bash
   touch .env.local
   ```

3. Add all required variables (see above)

### Verifying Configuration

```typescript
// Check if variables are loaded
console.log('Profile NFT:', process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS)
console.log('Chain ID:', process.env.NEXT_PUBLIC_FLOW_EVM_CHAIN_ID)
```

## Production Configuration

### Railway

1. Go to Railway project settings
2. Navigate to "Variables"
3. Add each variable:
   - `NEXT_PUBLIC_PROFILE_NFT_ADDRESS`
   - `NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS`
   - etc.

### Vercel

1. Go to project settings
2. Navigate to "Environment Variables"
3. Add variables for:
   - Production
   - Preview (optional)
   - Development (optional)

### Other Platforms

Follow platform-specific instructions for setting environment variables.

## Network-Specific Configuration

### Mainnet (Production)

```bash
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=747
NEXT_PUBLIC_FLOW_EVM_RPC_URL=https://mainnet.evm.nodes.onflow.org
NEXT_PUBLIC_ENVIRONMENT=mainnet
```

### Testnet (If Available)

```bash
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=<testnet_chain_id>
NEXT_PUBLIC_FLOW_EVM_RPC_URL=<testnet_rpc_url>
NEXT_PUBLIC_ENVIRONMENT=testnet
```

### Local Development

```bash
NEXT_PUBLIC_FLOW_EVM_CHAIN_ID=31337  # Hardhat default
NEXT_PUBLIC_FLOW_EVM_RPC_URL=http://localhost:8545
NEXT_PUBLIC_ENVIRONMENT=local
```

## Security Considerations

### Public Variables

All `NEXT_PUBLIC_*` variables are exposed to the browser. Never put sensitive data in these variables.

**Safe:**
- Contract addresses (public)
- RPC URLs (public)
- Chain IDs (public)

**Never:**
- Private keys
- API secrets
- Database credentials

### Private Variables

For server-only variables (not currently used):

```bash
# Server-only (not exposed to browser)
PRIVATE_KEY=0x...
DATABASE_URL=postgres://...
```

Access only in:
- API routes (`app/api/`)
- Server components (with caution)
- Server-side code

## Validation

### Type Safety

Contract addresses are typed:

```typescript
import { Address } from 'viem'

const address: Address = process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS as Address
```

### Runtime Validation

Validate environment variables on startup:

```typescript
// lib/config/validate.ts
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_PROFILE_NFT_ADDRESS',
    'NEXT_PUBLIC_TOKEN_QUALIFIER_ADDRESS',
    // ...
  ]

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}
```

## Troubleshooting

### Variables Not Loading

1. **Check file name**: Must be `.env.local` (not `.env`)
2. **Restart dev server**: Variables load on startup
3. **Check prefix**: Must start with `NEXT_PUBLIC_`
4. **Check syntax**: No spaces around `=`

### Wrong Values

1. **Check .env.local**: Verify values are correct
2. **Check deployment platform**: Verify production values
3. **Clear cache**: Delete `.next` folder and rebuild

### Type Errors

1. **Check types**: Use `as Address` for addresses
2. **Check imports**: Import types from `viem` or `ethers`

## Best Practices

1. **Never commit .env.local**: Already in `.gitignore`
2. **Document all variables**: Keep this guide updated
3. **Use defaults**: Provide fallback values in code
4. **Validate on startup**: Check required variables
5. **Type everything**: Use TypeScript types

## Example Configuration

### Complete .env.local

```bash
# ============================================
# ImmutableType Environment Configuration
# ============================================

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

## Further Reading

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Flow EVM Network Info](https://docs.onflow.org/evm/)
