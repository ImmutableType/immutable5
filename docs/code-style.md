# Code Style Guide

Coding standards and conventions for the ImmutableType codebase.

## TypeScript

### Type Safety

- **Use explicit types**: Avoid `any`, use specific types
- **Use interfaces**: For object shapes
- **Use type unions**: For multiple possible types
- **Enable strict mode**: TypeScript strict mode is enabled

```typescript
// Good
interface User {
  address: string
  profileId: string
}

// Bad
const user: any = { address: '0x...' }
```

### Naming Conventions

- **Interfaces**: PascalCase (`ProfileData`)
- **Types**: PascalCase (`WalletType`)
- **Variables**: camelCase (`userAddress`)
- **Constants**: UPPER_SNAKE_CASE (`WALLET_RDNS`)
- **Functions**: camelCase (`getProfile`)
- **Classes**: PascalCase (`ProfileNFTService`)

## React

### Component Structure

```typescript
'use client'  // If client component

import { useState, useEffect } from 'react'
import { useUnifiedWallet } from '@/lib/hooks/useUnifiedWallet'

interface Props {
  // Props interface
}

export function MyComponent({ prop1, prop2 }: Props) {
  // Hooks
  const { address } = useUnifiedWallet()
  const [state, setState] = useState(null)

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies])

  // Handlers
  const handleClick = () => {
    // Handler logic
  }

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Hooks

- **Custom hooks**: Start with `use` prefix
- **Extract logic**: Move complex logic to custom hooks
- **Dependencies**: Always include all dependencies in useEffect

```typescript
// Good
export function useMyFeature() {
  const { address } = useUnifiedWallet()
  // Hook logic
}

// Bad
export function myFeature() {  // Missing 'use' prefix
  // ...
}
```

## Services

### Service Pattern

```typescript
export class MyService {
  private provider: BrowserProvider | null = null
  private contract: Contract | null = null

  async initialize(provider?: BrowserProvider): Promise<void> {
    // Initialization
  }

  async myMethod(params: MyParams): Promise<MyResult> {
    if (!this.contract) {
      throw new Error('Service not initialized')
    }
    // Method implementation
  }
}
```

### Error Handling

```typescript
// Good: Structured error handling
try {
  const result = await service.method()
  return { success: true, data: result }
} catch (error) {
  return { success: false, error: error.message }
}

// Bad: Silent failures
try {
  await service.method()
} catch (error) {
  // Swallowed error
}
```

## File Organization

### File Naming

- **Components**: PascalCase (`WalletSelector.tsx`)
- **Hooks**: camelCase (`useUnifiedWallet.ts`)
- **Services**: PascalCase (`ProfileNFTService.ts`)
- **Utilities**: camelCase (`wordValidation.ts`)
- **Types**: camelCase (`profile.ts`)

### Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. Next.js imports
import { useRouter } from 'next/navigation'

// 3. Third-party imports
import { ethers } from 'ethers'

// 4. Internal imports (absolute paths)
import { useUnifiedWallet } from '@/lib/hooks/useUnifiedWallet'

// 5. Internal imports (relative paths)
import { MyComponent } from './MyComponent'

// 6. Types
import type { ProfileData } from '@/lib/types/profile'
```

## Comments

### When to Comment

- **Complex logic**: Explain why, not what
- **Workarounds**: Document temporary solutions
- **Public APIs**: Document function parameters and returns
- **TODOs**: Mark incomplete features

```typescript
// Good: Explains why
// Retry 5 times because some wallets announce late via EIP-6963
for (let i = 0; i < 5; i++) {
  // ...
}

// Bad: States the obvious
// Loop 5 times
for (let i = 0; i < 5; i++) {
  // ...
}
```

## Formatting

### ESLint Configuration

We use ESLint with Next.js config. Run:

```bash
npm run lint
```

### Prettier (Optional)

If using Prettier, configure to match ESLint rules.

## Best Practices

### 1. Use Services, Not Direct Contract Calls

```typescript
// Good
await profileNFTService.createBasicProfile(data, address, provider)

// Bad
await contract.createBasicProfile(data, { value: fee })
```

### 2. Handle Loading States

```typescript
const [loading, setLoading] = useState(false)

const handleAction = async () => {
  setLoading(true)
  try {
    await service.method()
  } finally {
    setLoading(false)
  }
}
```

### 3. Provide User Feedback

```typescript
// Good: Clear error messages
catch (error) {
  setError('Failed to create profile. Please try again.')
}

// Bad: Generic errors
catch (error) {
  setError('Error')
}
```

### 4. Type Everything

```typescript
// Good: Explicit types
interface ProfileData {
  displayName: string
  bio: string
}

// Bad: Implicit any
const profileData = { displayName: '...', bio: '...' }
```

## Further Reading

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Next.js Style Guide](https://nextjs.org/docs)
