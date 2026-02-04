# Development Guide

Guide for developers working on the ImmutableType codebase.

## Development Environment Setup

### Recommended Tools

- **VS Code** - Recommended editor
- **ESLint Extension** - For code linting
- **Prettier Extension** - For code formatting (optional)
- **GitLens Extension** - For Git integration (optional)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Development Workflow

### Starting Development

```bash
# Start dev server
npm run dev

# In another terminal, watch for changes
npm run lint -- --watch
```

### Code Structure

```
app/                    # Next.js App Router
├── (client)/          # Client routes
├── components/         # React components
│   ├── features/      # Feature components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
└── layout.tsx         # Root layout

lib/                    # Core library
├── hooks/             # React hooks
├── services/          # Service layer
├── web3/              # Web3 utilities
└── types/             # TypeScript types

contracts/              # Smart contracts
scripts/                # Deployment scripts
```

### Component Development

#### Creating a New Component

```typescript
// app/components/features/myfeature/MyComponent.tsx
'use client'

import { useState } from 'react'
import { useUnifiedWallet } from '@/lib/hooks/useUnifiedWallet'

export function MyComponent() {
  const { address, isConnected } = useUnifiedWallet()
  const [state, setState] = useState(null)

  // Component logic...

  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

#### Component Best Practices

1. **Use 'use client'** for client components
2. **Use TypeScript** for all components
3. **Extract logic** to custom hooks when reusable
4. **Use services** for contract interactions
5. **Handle loading states** and errors

### Service Development

#### Creating a New Service

```typescript
// lib/services/myfeature/MyService.ts
import { ethers, Contract, BrowserProvider } from 'ethers'
import { CONTRACTS, MY_CONTRACT_ABI } from '../../web3/contracts'

export class MyService {
  private provider: BrowserProvider | null = null
  private contract: Contract | null = null

  async initialize(provider?: BrowserProvider): Promise<void> {
    // Implementation
  }

  async myMethod(params: MyParams): Promise<MyResult> {
    // Implementation
  }
}
```

### Hook Development

#### Creating a Custom Hook

```typescript
// lib/hooks/useMyFeature.ts
import { useState, useEffect } from 'react'
import { useUnifiedWallet } from './useUnifiedWallet'

export function useMyFeature() {
  const { address, isConnected } = useUnifiedWallet()
  const [data, setData] = useState(null)

  useEffect(() => {
    if (isConnected && address) {
      // Fetch data
    }
  }, [isConnected, address])

  return { data }
}
```

## Testing

### Manual Testing

1. **Test wallet connections**
   - MetaMask
   - Flow Wallet
   - Both installed
   - Neither installed

2. **Test features**
   - Profile creation
   - Bookmark minting
   - Network switching
   - Error handling

3. **Test edge cases**
   - Insufficient balance
   - Network errors
   - User rejection
   - Invalid inputs

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- MyTest.test.ts
```

## Debugging

### Browser DevTools

1. **Console Logging**
   - Check for errors
   - Look for debug logs
   - Monitor network requests

2. **React DevTools**
   - Inspect component state
   - Check hook values
   - Monitor re-renders

3. **Network Tab**
   - Check RPC requests
   - Monitor transaction status
   - Verify contract calls

### Debug Helpers

```typescript
// Check Flow Wallet
window.inspectFlowWallet()

// Check EIP-6963 providers
import { getAllProviders } from '@/lib/web3/eip6963'
console.log(getAllProviders())
```

### Common Debugging Scenarios

#### Wallet Not Connecting

1. Check browser console for errors
2. Verify wallet is installed and enabled
3. Check EIP-6963 discovery logs
4. Verify network configuration

#### Contract Calls Failing

1. Check contract address
2. Verify network (Flow EVM Mainnet)
3. Check gas/balance
4. Verify ABI matches contract

#### State Not Updating

1. Check React DevTools
2. Verify useEffect dependencies
3. Check for state batching
4. Verify provider updates

## Code Quality

### Linting

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Type Checking

```bash
# Check types
npm run build

# Type check only
npx tsc --noEmit
```

### Code Formatting

We use ESLint for formatting. Configure your editor to format on save.

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch (if used)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Examples:
- feat(wallet): add WalletConnect support
- fix(profile): fix profile creation error
- docs(readme): update installation guide
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Create PR with description
6. Address review feedback
7. Merge after approval

## Performance Optimization

### Code Splitting

Next.js automatically code-splits, but you can optimize:

```typescript
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />
})
```

### Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
/>
```

### Memoization

Use React.memo and useMemo for expensive operations:

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  const processed = useMemo(() => {
    return expensiveOperation(data)
  }, [data])
  
  return <div>{processed}</div>
})
```

## Environment Variables

### Development

Use `.env.local`:
- Not committed to git
- Overrides `.env`
- Used by `npm run dev`

### Production

Use `.env.production`:
- Set in deployment platform
- Used by `npm run build`

### Variable Naming

- Prefix with `NEXT_PUBLIC_` for client-side access
- Use descriptive names
- Document in `.env.example`

## Smart Contract Development

### Local Contract Testing

1. **Start Hardhat node**:
   ```bash
   npx hardhat node
   ```

2. **Deploy contracts**:
   ```bash
   npx hardhat run scripts/deploy-profile.js --network localhost
   ```

3. **Update .env.local**:
   ```bash
   NEXT_PUBLIC_PROFILE_NFT_ADDRESS=<deployed_address>
   ```

4. **Test locally**:
   ```bash
   npm run dev
   ```

### Contract Testing

```bash
# Run contract tests
npx hardhat test

# Run specific test
npx hardhat test test/ProfileNFT.test.js

# Gas reporting
REPORT_GAS=true npx hardhat test
```

## Common Development Tasks

### Adding a New Feature

1. Create feature branch
2. Add component/service/hook
3. Update types
4. Add tests
5. Update documentation
6. Create PR

### Fixing a Bug

1. Reproduce the bug
2. Identify root cause
3. Write test (if applicable)
4. Fix the bug
5. Verify fix
6. Update documentation if needed

### Refactoring

1. Identify code to refactor
2. Ensure tests exist
3. Refactor incrementally
4. Run tests frequently
5. Verify functionality unchanged

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [ethers.js Documentation](https://docs.ethers.org)
- [Flow EVM Documentation](https://docs.onflow.org/evm/)
