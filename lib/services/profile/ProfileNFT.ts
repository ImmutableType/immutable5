import { ethers, Contract, BrowserProvider, TransactionReceipt, ContractTransactionResponse, FunctionFragment } from 'ethers'
import type { ProfileData, ProfileCreationResult } from '../../types/profile'
import { CONTRACTS, PROFILE_NFT_ABI } from '../../web3/contracts'

interface ProfileDisplayData {
  tier: number
  did: string
  displayName: string
  bio: string
  location: string
  avatarUrl: string
  createdAt: number
  isActive: boolean
}

export class ProfileNFTService {
  private contractAddress = CONTRACTS.PROFILE_NFT
  private provider: BrowserProvider | null = null
  private contract: Contract | null = null

  async initialize(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found')
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.contract = new ethers.Contract(
      this.contractAddress,
      PROFILE_NFT_ABI,
      this.provider
    )
  }

  async getProfile(profileId: string): Promise<ProfileDisplayData> {
    if (!this.contract) {
      await this.initialize()
    }

    try {
      const profileData = await this.contract!.getProfile(profileId)
      return {
        tier: Number(profileData.tier),
        did: profileData.did,
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location,
        avatarUrl: profileData.avatarUrl,
        createdAt: Number(profileData.createdAt),
        isActive: profileData.isActive
      }
    } catch (error: unknown) {
      const err = error as Error
      throw new Error(`Failed to get profile: ${err.message}`)
    }
  }

  private extractProfileIdFromReceipt(receipt: TransactionReceipt): string {
    try {
      // Try multiple approaches to find the profile ID
      
      // Method 1: Look for ProfileCreated event in logs
      for (const log of receipt.logs || []) {
        try {
          const parsedLog = this.contract!.interface.parseLog({
            topics: log.topics,
            data: log.data
          })
          
          if (parsedLog && parsedLog.name === 'ProfileCreated') {
            const profileId = parsedLog.args.profileId || parsedLog.args.tokenId
            if (profileId) {
              return profileId.toString()
            }
          }
        } catch {
          // Continue to next method if parsing fails
        }
      }
      
      // Method 2: Extract from Transfer event (ERC721 standard)
      for (const log of receipt.logs || []) {
        if (log.topics.length >= 4 && log.topics[0].includes('ddf252ad')) { // Transfer event signature
          const tokenId = log.topics[3]
          if (tokenId) {
            return this.parseHexToDecimal(tokenId)
          }
        }
      }
      
      // Method 3: Look in topics[3] of first log (original approach)
      const firstLog = receipt.logs?.[0]
      if (firstLog && firstLog.topics && firstLog.topics[3]) {
        return this.parseHexToDecimal(firstLog.topics[3])
      }
      
      // Method 4: Generate timestamp-based fallback ID
      const fallbackId = Date.now().toString()
      console.warn('Could not extract profile ID from receipt, using timestamp fallback:', fallbackId)
      return fallbackId
      
    } catch (error) {
      console.error('Profile ID extraction failed:', error)
      return Date.now().toString()
    }
  }

  private parseHexToDecimal(hexValue: string): string {
    try {
      if (!hexValue || typeof hexValue !== 'string') {
        throw new Error('Invalid hex value')
      }
      
      // Clean and validate hex string
      const cleanHex = hexValue.trim()
      if (!cleanHex.startsWith('0x')) {
        return cleanHex // Already a decimal string
      }
      
      // Use BigInt for safe conversion of large numbers
      const decimalValue = BigInt(cleanHex).toString()
      
      // Validate result is reasonable
      if (decimalValue === '0') {
        throw new Error('Converted to zero, likely invalid')
      }
      
      return decimalValue
      
    } catch (error) {
      console.warn('Hex to decimal conversion failed:', hexValue, error)
      // Return original value or fallback
      return hexValue.startsWith('0x') ? '1' : hexValue
    }
  }

  async createBasicProfile(profileData: ProfileData, address: string): Promise<ProfileCreationResult> {
    try {
      if (!this.provider || !this.contract) {
        await this.initialize()
      }

      const signer = await this.provider!.getSigner()
      const userAddress = await signer.getAddress()
      const contractWithSigner = this.contract!.connect(signer)

      console.log("=== CONTRACT DEBUG INFO ===")
      console.log("Contract address:", this.contractAddress)
      console.log("User address:", userAddress)
      console.log("Passed address:", address)
      
      try {
        const tokenQualifierAddr = await this.contract!.tokenQualifier()
        console.log("TokenQualifier address:", tokenQualifierAddr)
      } catch (e: unknown) {
        const error = e as Error
        console.log("Error getting TokenQualifier:", error.message)
      }
      
      try {
        const profileCount = await this.contract!.balanceOf(userAddress)
        console.log("User profile count:", profileCount.toString())
      } catch (e: unknown) {
        const error = e as Error
        console.log("Error getting profile count:", error.message)
      }

      console.log("Available contract functions:")
      const contractInterface = this.contract!.interface
      const fragments = contractInterface.fragments
      fragments.forEach((fragment) => {
        if (fragment.type === 'function') {
          const funcFragment = fragment as FunctionFragment
          console.log("  -", funcFragment.name)
        }
      })

      console.log("=== END DEBUG INFO ===")

      // Try without fee payment first (BUFFAFLOW bypass)
      console.log("=== ATTEMPTING TRANSACTION WITHOUT FEE ===")
      try {
        const tx = await (contractWithSigner as Contract).createBasicProfile(
          profileData.displayName || '',
          profileData.bio || '',
          profileData.location || '',
          profileData.avatarUrl || ''
        ) as ContractTransactionResponse
        console.log("Transaction sent (no fee):", tx.hash)
        
        const receipt = await tx.wait() as TransactionReceipt
        console.log("Transaction confirmed:", receipt.hash)
        
        const profileId = this.extractProfileIdFromReceipt(receipt)
        
        return {
          success: true,
          profileId,
          did: `did:pkh:eip155:747:${userAddress.toLowerCase()}`,
          transactionHash: receipt.hash
        }
        
      } catch (error: unknown) {
        const err = error as Error
        console.log("Transaction failed without fee:", err.message)
        
        // Try with fee payment
        console.log("=== ATTEMPTING TRANSACTION WITH 3 FLOW FEE ===")
        try {
          const txWithFee = await (contractWithSigner as Contract).createBasicProfile(
            profileData.displayName || '',
            profileData.bio || '',
            profileData.location || '',
            profileData.avatarUrl || '',
            { value: ethers.parseEther('3') }
          ) as ContractTransactionResponse
          console.log("Transaction sent (with fee):", txWithFee.hash)
          
          const receiptWithFee = await txWithFee.wait() as TransactionReceipt
          console.log("Transaction confirmed:", receiptWithFee.hash)
          
          const profileId = this.extractProfileIdFromReceipt(receiptWithFee)
          
          return {
            success: true,
            profileId,
            did: `did:pkh:eip155:747:${userAddress.toLowerCase()}`,
            transactionHash: receiptWithFee.hash
          }
          
        } catch (feeError: unknown) {
          const feeErr = feeError as Error
          console.error("Transaction failed with fee:", feeErr.message)
          return {
            success: false,
            error: feeErr.message
          }
        }
      }

    } catch (error: unknown) {
      const err = error as Error
      console.error("=== DETAILED TRANSACTION ERROR ===")
      console.error("Full error:", error)
      console.error("Error message:", err.message)
      
      return {
        success: false,
        error: err.message || 'Unknown error occurred'
      }
    }
  }

  async getProfileCount(userAddress: string): Promise<number> {
    if (!this.contract) {
      await this.initialize()
    }

    try {
      const count = await this.contract!.balanceOf(userAddress)
      return Number(count)
    } catch (error: unknown) {
      console.error('Error getting profile count:', error)
      return 0
    }
  }

  async canCreateProfile(userAddress: string): Promise<boolean> {
    const count = await this.getProfileCount(userAddress)
    return count === 0
  }
  
  generateDID(address: string): string {
    return `did:pkh:eip155:747:${address.toLowerCase()}`
  }
  
  getCreationFeeFormatted(): string {
    return "3 FLOW"
  }
}

export const profileNFTService = new ProfileNFTService()