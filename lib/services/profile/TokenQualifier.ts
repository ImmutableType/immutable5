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

  // Add timeout wrapper for contract calls
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Contract call timeout after ${timeoutMs}ms`))
      }, timeoutMs)

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout))
    })
  }

  async checkQualification(userAddress: string): Promise<QualificationStatus> {
    try {
      if (!this.provider) {
        await this.initialize()
      }

      console.log('Checking BUFFAFLOW qualification for:', userAddress)

      // CRITICAL CHANGE: Use the new isQualified function on deployed contract
      const tokenQualifierContract = new ethers.Contract(
        CONTRACTS.TOKEN_QUALIFIER,
        TOKEN_QUALIFIER_ABI,
        this.provider
      )

      // Call the fixed isQualified function
      const isQualified = await this.withTimeout(
        tokenQualifierContract.isQualified(userAddress),
        8000
      )

      // Still check BUFFAFLOW for display purposes
      const buffaflowContract = new ethers.Contract(
        CONTRACTS.BUFFAFLOW,
        BUFFAFLOW_ABI,
        this.provider
      )

      // Check token balance for display
      console.log('Checking token balance for display...')
      let formattedBalance = 'N/A'
      let nftCount = 0
      
      try {
        const tokenBalance = await this.withTimeout(
          buffaflowContract.balanceOf(userAddress),
          8000
        )
        formattedBalance = ethers.formatEther(tokenBalance)
        console.log('Token balance:', formattedBalance)
      } catch (error) {
        console.log('Token balance check failed:', error)
      }

      // Try to check NFT balance for display
      try {
        console.log('Checking NFT balance for display...')
        const nftBalance = await this.withTimeout(
          buffaflowContract.erc721BalanceOf(userAddress),
          5000
        )
        nftCount = Number(nftBalance)
        console.log('NFT count:', nftCount)
      } catch (error) {
        console.log('NFT balance check failed:', error)
        nftCount = 0
      }

      console.log('Qualification result from contract:', {
        isQualified,
        canBypassFee: isQualified
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