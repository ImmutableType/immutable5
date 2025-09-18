import { ethers, Contract, BrowserProvider, TransactionReceipt, ContractTransactionResponse } from 'ethers'
import { MMSDK } from '../../web3/metamask'
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
    // Use shared MetaMask SDK instance
    const sdkProvider = MMSDK.getProvider()
    
    if (!sdkProvider) {
      throw new Error('MetaMask provider not available - please connect wallet first')
    }
    
    this.provider = new ethers.BrowserProvider(sdkProvider)
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
      // Look for ProfileCreated event in logs
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
          continue
        }
      }
      
      // Fallback: Extract from Transfer event
      for (const log of receipt.logs || []) {
        if (log.topics.length >= 4 && log.topics[0].includes('ddf252ad')) {
          const tokenId = log.topics[3]
          if (tokenId) {
            return BigInt(tokenId).toString()
          }
        }
      }
      
      // Final fallback
      return Date.now().toString()
      
    } catch (error) {
      console.error('Profile ID extraction failed:', error)
      return Date.now().toString()
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

      console.log('Creating profile with data:', profileData)
      console.log('User address:', userAddress)

      // Try without fee first (BUFFAFLOW bypass), then with fee
      try {
        console.log('Attempting profile creation without fee...')
        const tx = await (contractWithSigner as Contract).createBasicProfile(
          profileData.displayName || '',
          profileData.bio || '',
          profileData.location || '',
          profileData.avatarUrl || ''
        ) as ContractTransactionResponse
        
        console.log('Transaction sent (no fee):', tx.hash)
        const receipt = await tx.wait() as TransactionReceipt
        console.log('Transaction confirmed:', receipt.hash)
        
        const profileId = this.extractProfileIdFromReceipt(receipt)
        
        return {
          success: true,
          profileId,
          did: `did:pkh:eip155:747:${userAddress.toLowerCase()}`,
          transactionHash: receipt.hash
        }
        
      } catch (error: unknown) {
        const err = error as Error
        console.log('No-fee transaction failed, trying with 3 FLOW fee:', err.message)
        
        // Try with 3 FLOW fee
        const txWithFee = await (contractWithSigner as Contract).createBasicProfile(
          profileData.displayName || '',
          profileData.bio || '',
          profileData.location || '',
          profileData.avatarUrl || '',
          { value: ethers.parseEther('3') }
        ) as ContractTransactionResponse
        
        console.log('Transaction sent (with fee):', txWithFee.hash)
        const receiptWithFee = await txWithFee.wait() as TransactionReceipt
        console.log('Transaction confirmed:', receiptWithFee.hash)
        
        const profileId = this.extractProfileIdFromReceipt(receiptWithFee)
        
        return {
          success: true,
          profileId,
          did: `did:pkh:eip155:747:${userAddress.toLowerCase()}`,
          transactionHash: receiptWithFee.hash
        }
      }

    } catch (error: unknown) {
      const err = error as Error
      console.error('Profile creation failed:', error)
      
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