import { Address, formatEther } from 'viem'
import { readContract } from 'wagmi/actions'
import { wagmiConfig } from '../../web3/providers'
import { CONTRACTS, CONFIG, TOKEN_QUALIFIER_ABI, BUFFAFLOW_ABI, getNetworkConfig } from '../../web3/contracts'
import type { QualificationStatus } from '../../types/profile'

export class TokenQualifierService {
  private qualifierAddress: Address = CONTRACTS.TOKEN_QUALIFIER
  
  // Real BUFFAFLOW address (mainnet) - will be configured via env vars
  private readonly BUFFAFLOW_MAINNET = '0xc8654a7a4bd671d4ceac6096a92a3170fa3b4798' as Address

  /**
   * Check if user qualifies for fee bypass
   * Real implementation - no mocks
   */
  async checkQualification(userAddress: Address): Promise<QualificationStatus> {
    try {
      // If BUFFAFLOW bypass is disabled, return not qualified
      if (!CONFIG.ENABLE_BUFFAFLOW_BYPASS) {
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

      // If no BUFFAFLOW address configured, can't check
      const buffaflowAddress = this.getBuffaflowAddress()
      if (!buffaflowAddress || buffaflowAddress === '0x0000000000000000000000000000000000000000') {
        return {
          isQualified: false,
          tokenBalance: '0',
          nftCount: 0,
          canBypassFee: false
        }
      }

      // Check real BUFFAFLOW balance (when address is configured)
      return await this.checkBuffaflowBalance(userAddress, buffaflowAddress)

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
   * Get BUFFAFLOW address based on network (using dynamic network detection)
   */
  private getBuffaflowAddress(): Address | null {
    // Use environment variable if set, otherwise use network-based logic
    const envAddress = process.env.NEXT_PUBLIC_BUFFAFLOW_ADDRESS
    if (envAddress && envAddress !== '0x0000000000000000000000000000000000000000') {
      return envAddress as Address
    }

    // Get current network config dynamically
    const networkConfig = getNetworkConfig()
    
    // Return BUFFAFLOW address if on mainnet and available
    return networkConfig.buffaflowAddress as Address || null
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
    
    const buffaflowAddress = this.getBuffaflowAddress()
    if (!buffaflowAddress) {
      return 'BUFFAFLOW not available on this network'
    }
    
    const threshold = this.getQualificationThreshold()
    return `Hold ${threshold}+ $BUFFAFLOW tokens OR any $BUFFAFLOW NFT`
  }

  /**
   * Check if BUFFAFLOW bypass is available
   */
  isBuffaflowBypassAvailable(): boolean {
    return CONFIG.ENABLE_BUFFAFLOW_BYPASS && !!this.getBuffaflowAddress()
  }

  /**
   * Get current network info for BUFFAFLOW (using dynamic network detection)
   */
  getNetworkInfo(): { hasBuffaflow: boolean; networkName: string; buffaflowAddress?: Address } {
    const networkConfig = getNetworkConfig()
    const buffaflowAddress = this.getBuffaflowAddress()
    
    return {
      hasBuffaflow: !!buffaflowAddress,
      networkName: networkConfig.networkName,
      buffaflowAddress: buffaflowAddress || undefined
    }
  }
}

// Export singleton instance  
export const tokenQualifierService = new TokenQualifierService()