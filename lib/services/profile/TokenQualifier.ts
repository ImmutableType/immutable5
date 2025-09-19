import { ethers, Contract, BrowserProvider } from 'ethers'
import { MMSDK } from '../../web3/metamask'
import { CONTRACTS, TOKEN_QUALIFIER_ABI, BUFFAFLOW_ABI } from '../../web3/contracts'
import type { QualificationStatus } from '../../types/profile'

export class TokenQualifierService {
  private provider: BrowserProvider | null = null

  async initialize(): Promise<void> {
    // Use shared MetaMask SDK instance
    const sdkProvider = MMSDK.getProvider()
    
    if (!sdkProvider) {
      throw new Error('MetaMask provider not available - please connect wallet first')
    }
    
    this.provider = new ethers.BrowserProvider(sdkProvider)
  }

  // Detect if running on mobile
  private isMobile(): boolean {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Mobile-aware timeout wrapper with retry logic
  private async withTimeoutAndRetry<T>(
    promise: () => Promise<T>, 
    timeoutMs: number = 10000,
    maxRetries: number = 2
  ): Promise<T> {
    // Use longer timeouts on mobile
    const actualTimeout = this.isMobile() ? Math.max(timeoutMs, 15000) : timeoutMs
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Contract call timeout after ${actualTimeout}ms (attempt ${attempt + 1})`))
          }, actualTimeout)

          promise()
            .then(resolve)
            .catch(reject)
            .finally(() => clearTimeout(timeout))
        })
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed:`, error)
        
        // If last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw error
        }
        
        // Wait before retry (longer on mobile)
        const retryDelay = this.isMobile() ? 2000 : 1000
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
    
    throw new Error('All retry attempts failed')
  }

  async checkQualification(userAddress: string): Promise<QualificationStatus> {
    try {
      if (!this.provider) {
        await this.initialize()
      }

      console.log('Checking BUFFAFLOW qualification for:', userAddress)
      console.log('Mobile device detected:', this.isMobile())

      // Use the new isQualified function on deployed contract with retry logic
      const tokenQualifierContract = new ethers.Contract(
        CONTRACTS.TOKEN_QUALIFIER,
        TOKEN_QUALIFIER_ABI,
        this.provider
      )

      // Call the fixed isQualified function with mobile-aware retry
      const isQualified = await this.withTimeoutAndRetry(
        () => tokenQualifierContract.isQualified(userAddress),
        this.isMobile() ? 20000 : 8000, // 20s mobile, 8s desktop
        this.isMobile() ? 3 : 2 // More retries on mobile
      )

      console.log('Contract qualification result:', isQualified)

      // Still check BUFFAFLOW for display purposes with mobile-aware timeouts
      const buffaflowContract = new ethers.Contract(
        CONTRACTS.BUFFAFLOW,
        BUFFAFLOW_ABI,
        this.provider
      )

      let formattedBalance = 'N/A'
      let nftCount = 0
      
      try {
        console.log('Checking token balance for display...')
        const tokenBalance = await this.withTimeoutAndRetry(
          () => buffaflowContract.balanceOf(userAddress),
          this.isMobile() ? 20000 : 8000,
          this.isMobile() ? 3 : 2
        )
        formattedBalance = ethers.formatEther(tokenBalance)
        console.log('Token balance:', formattedBalance)
      } catch (error) {
        console.log('Token balance check failed:', error)
      }

      // Try to check NFT balance for display with mobile-aware handling
      try {
        console.log('Checking NFT balance for display...')
        const nftBalance = await this.withTimeoutAndRetry(
          () => buffaflowContract.erc721BalanceOf(userAddress),
          this.isMobile() ? 15000 : 5000,
          this.isMobile() ? 2 : 1 // Fewer retries for NFT check
        )
        nftCount = Number(nftBalance)
        console.log('NFT count:', nftCount)
      } catch (error) {
        console.log('NFT balance check failed:', error)
        nftCount = 0
      }

      console.log('Final qualification result:', {
        isQualified,
        canBypassFee: isQualified,
        isMobile: this.isMobile()
      })

      return {
        isQualified,
        tokenBalance: formattedBalance,
        nftCount,
        canBypassFee: isQualified
      }

    } catch (error) {
      console.error('Error checking qualification:', error)
      
      // Return safe fallback - user will pay fee
      return {
        isQualified: false,
        tokenBalance: 'Check failed',
        nftCount: 0,
        canBypassFee: false
      }
    }
  }

  getQualificationThreshold(): string {
    return '100'
  }

  getQualificationRequirements(): string {
    return 'Hold 100+ $BUFFAFLOW tokens OR any $BUFFAFLOW NFT'
  }

  isBuffaflowBypassAvailable(): boolean {
    return true
  }
}

export const tokenQualifierService = new TokenQualifierService()