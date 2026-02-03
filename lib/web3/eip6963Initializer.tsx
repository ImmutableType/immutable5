'use client'

import { useEffect } from 'react'
import { initEIP6963Discovery } from './eip6963'

/**
 * Client component that initializes EIP-6963 wallet discovery
 * as early as possible in the app lifecycle
 */
export function EIP6963Initializer() {
  useEffect(() => {
    // Initialize EIP-6963 discovery immediately on client mount
    if (typeof window !== 'undefined') {
      initEIP6963Discovery()
    }
  }, [])

  // This component doesn't render anything
  return null
}
