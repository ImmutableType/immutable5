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

  async checkQualification(userAddress: string): Promise<QualificationStatus> {
    try {
      if (!this.provider) {
        await this.initialize()
      }

      // Check BUFFAFLOW balance (ERC20 + ERC404 NFTs)
      const buffaflowContract = new ethers.Contract(
        CONTRACTS.BUFFAFLOW,
        BUFFAFLOW_ABI,
        this.provider
      )

      // Check token balance
      const tokenBalance = await buffaflowContract.balanceOf(userAddress)
      const formattedBalance = ethers.formatEther(tokenBalance)
      
      // Check if balance >= 100 tokens
      const threshold = ethers.parseEther('100')
      const hasEnoughTokens = tokenBalance >= threshold

      // Try to check NFT balance (ERC404 pattern)
      let nftCount = 0
      try {
        const nftBalance = await buffaflowContract.erc721BalanceOf(userAddress)
        nftCount = Number(nftBalance)
      } catch {
        // NFT function might not exist or might fail
        nftCount = 0
      }

      const canBypassFee = hasEnoughTokens || nftCount > 0

      return {
        isQualified: canBypassFee,
        tokenBalance: formattedBalance,
        nftCount,
        canBypassFee
      }

    } catch (error) {
      console.error('Error checking BUFFAFLOW qualification:', error)
      return {
        isQualified: false,
        tokenBalance: '0',
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