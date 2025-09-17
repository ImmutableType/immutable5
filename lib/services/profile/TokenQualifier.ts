import { Address, formatEther } from 'viem'
import { readContract } from 'wagmi/actions'
import { wagmiConfig } from '../../web3/providers'
import { CONTRACTS, CONFIG, TOKEN_QUALIFIER_ABI, BUFFAFLOW_ABI, getNetworkConfig } from '../../web3/contracts'
import type { QualificationStatus } from '../../types/profile'

export class TokenQualifierService {
  private qualifierAddress: Address = CONTRACTS.TOKEN_QUALIFIER
  
  // Real BUFFAFLOW address (mainnet)
  private readonly BUFFAFLOW_MAINNET = CONTRACTS.BUFFAFLOW

  /**
   * Check if user qualifies for fee bypass
   * Real implementation - no mocks
   */
  async checkQualification(userAddress: Address): Promise<QualificationStatus> {
    try {
      // If BUFFAFLOW bypass is disabled, return not qualified
      if (true) { // Force disable

        return {
          isQualified: false,
          tokenBalance: '0',
          nftCount: 0,
          canBypassFee: false
        }
      }

      // Check TokenQualifier contract first
      const isQualifiedFromContract = await this.checkTokenQualifierContract(userAddress)
      
      if (isQualifiedFromContract) {
        return {
          isQualified: true,
          tokenBalance: 'N/A', // TokenQualifier handles the logic
          nftCount: 0,
          canBypassFee: true
        }
      }

      // Check real BUFFAFLOW balance (mainnet address is always configured)
      return await this.checkBuffaflowBalance(userAddress, this.BUFFAFLOW_MAINNET)

    } catch (error) {
      console.error('Error checking qualification:', error)
      return {
        isQualified: false,
        tokenBalance: '0',
        nftCount: 0,
        canBypassFee: false
      }
    }
  }

  /**
   * Check TokenQualifier contract
   */
  private async checkTokenQualifierContract(userAddress: Address): Promise<boolean> {
    try {
      const isQualified = await readContract(wagmiConfig, {
        address: this.qualifierAddress,
        abi: TOKEN_QUALIFIER_ABI,
        functionName: 'isQualified',
        args: [userAddress]
      })
      
      return Boolean(isQualified)
    } catch (error) {
      console.error('Error checking token qualifier:', error)
      return false
    }
  }

  /**
   * Check real BUFFAFLOW balance (404 contract with tokens + NFTs)
   */
  private async checkBuffaflowBalance(userAddress: Address, buffaflowAddress: Address): Promise<QualificationStatus> {
    try {
      // Check ERC20 token balance
      const tokenBalance = await readContract(wagmiConfig, {
        address: buffaflowAddress,
        abi: BUFFAFLOW_ABI,
        functionName: 'balanceOf',
        args: [userAddress]
      }) as bigint

      // Check ERC721 NFT balance (404 contracts typically have separate balanceOf for NFTs)
      let nftCount = 0
      try {
        // 404 contracts may have different function names for NFT balance
        const nftBalance = await readContract(wagmiConfig, {
          address: buffaflowAddress,
          abi: [
            {
              "inputs": [{"name": "owner", "type": "address"}],
              "name": "erc721BalanceOf", // Common 404 pattern
              "outputs": [{"name": "", "type": "uint256"}],
              "stateMutability": "view",
              "type": "function"
            }
          ],
          functionName: 'erc721BalanceOf',
          args: [userAddress]
        }) as bigint
        
        nftCount = Number(nftBalance)
      } catch {
        // If erc721BalanceOf doesn't exist, try standard balanceOf with different context
        // 404 contracts handle this automatically
      }

      const threshold = BigInt(CONFIG.BUFFAFLOW_THRESHOLD)
      const canBypassFee = tokenBalance >= threshold || nftCount > 0
      
      return {
        isQualified: canBypassFee,
        tokenBalance: formatEther(tokenBalance),
        nftCount,
        canBypassFee
      }

    } catch (error) {
      console.error('Error checking BUFFAFLOW balance:', error)
      return {
        isQualified: false,
        tokenBalance: '0',
        nftCount: 0,
        canBypassFee: false
      }
    }
  }

  /**
   * Get qualification threshold for display
   */
  getQualificationThreshold(): string {
    return formatEther(BigInt(CONFIG.BUFFAFLOW_THRESHOLD))
  }

  /**
   * Get qualification requirements text
   */
  getQualificationRequirements(): string {
    if (!CONFIG.ENABLE_BUFFAFLOW_BYPASS) {
      return 'BUFFAFLOW bypass disabled'
    }
    
    const threshold = this.getQualificationThreshold()
    return `Hold ${threshold}+ $BUFFAFLOW tokens OR any $BUFFAFLOW NFT`
  }

  /**
   * Check if BUFFAFLOW bypass is available (always true on mainnet)
   */
  isBuffaflowBypassAvailable(): boolean {
    return CONFIG.ENABLE_BUFFAFLOW_BYPASS
  }

  /**
   * Get current network info for BUFFAFLOW (always mainnet)
   */
  getNetworkInfo(): { hasBuffaflow: boolean; networkName: string; buffaflowAddress: Address } {
    const networkConfig = getNetworkConfig()
    
    return {
      hasBuffaflow: true,
      networkName: networkConfig.networkName,
      buffaflowAddress: this.BUFFAFLOW_MAINNET
    }
  }
}

// Export singleton instance  
export const tokenQualifierService = new TokenQualifierService()