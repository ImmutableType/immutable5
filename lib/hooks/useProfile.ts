import { useState, useEffect, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Address } from 'viem'
import { profileNFTService } from '../services/profile/ProfileNFT'
import { tokenQualifierService } from '../services/profile/TokenQualifier'
import type { 
    ProfileData, 
    ProfileCreationResult, 
    Profile, 
    TransactionState, 
    QualificationStatus,
    ProfileFormErrors
  } from '../types/profile'
  import { PROFILE_VALIDATION } from '../types/profile'

export interface UseProfileReturn {
  // Wallet state
  isConnected: boolean
  address?: Address
  connect: () => void
  disconnect: () => void
  
  // Profile state
  userProfile: Profile | null
  isLoadingProfile: boolean
  
  // Creation state
  creationState: TransactionState
  isCreating: boolean
  
  // Qualification state
  qualificationStatus: QualificationStatus | null
  isCheckingQualification: boolean
  canBypassFee: boolean
  
  // Form validation
  formErrors: ProfileFormErrors
  
  // Actions
  createProfile: (profileData: ProfileData) => Promise<ProfileCreationResult>
  checkQualification: () => Promise<void>
  validateForm: (profileData: ProfileData) => boolean
  clearErrors: () => void
  generateDID: () => string | null
  
  // Helpers
  getCreationFee: () => string
  isFeeRequired: () => boolean
  getQualificationText: () => string
}

export function useProfile(): UseProfileReturn {
  // Wallet connection hooks
  const { address, isConnected } = useAccount()
  const { connect: wagmiConnect, connectors } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  // State management
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [creationState, setCreationState] = useState<TransactionState>({ status: 'idle' })
  const [qualificationStatus, setQualificationStatus] = useState<QualificationStatus | null>(null)
  const [isCheckingQualification, setIsCheckingQualification] = useState(false)
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({})

  // Wallet connection handlers
  const connect = useCallback(() => {
    const connector = connectors[0] // Use first available connector (MetaMask/Injected)
    if (connector) {
      wagmiConnect({ connector })
    }
  }, [wagmiConnect, connectors])

  const disconnect = useCallback(() => {
    wagmiDisconnect()
  }, [wagmiDisconnect])

  // Load user's existing profile (if any)
  const loadUserProfile = useCallback(async () => {
    if (!address) return

    setIsLoadingProfile(true)
    try {
      // TODO: Implement after we have profile lookup by address
      // For now, just clear the profile
      setUserProfile(null)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [address])

  // Check BUFFAFLOW qualification status
  const checkQualification = useCallback(async () => {
    if (!address) {
      setQualificationStatus(null)
      return
    }

    setIsCheckingQualification(true)
    try {
      const status = await tokenQualifierService.checkQualification(address)
      setQualificationStatus(status)
    } catch (error) {
      console.error('Error checking qualification:', error)
      setQualificationStatus({
        isQualified: false,
        tokenBalance: '0',
        nftCount: 0,
        canBypassFee: false
      })
    } finally {
      setIsCheckingQualification(false)
    }
  }, [address])

  // Form validation
  const validateForm = useCallback((profileData: ProfileData): boolean => {
    const errors: ProfileFormErrors = {}

    // Display Name validation
    if (!profileData.displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (profileData.displayName.length < PROFILE_VALIDATION.DISPLAY_NAME.min) {
      errors.displayName = `Display name must be at least ${PROFILE_VALIDATION.DISPLAY_NAME.min} characters`
    } else if (profileData.displayName.length > PROFILE_VALIDATION.DISPLAY_NAME.max) {
      errors.displayName = `Display name must be no more than ${PROFILE_VALIDATION.DISPLAY_NAME.max} characters`
    }

    // Bio validation
    if (profileData.bio.length > PROFILE_VALIDATION.BIO.max) {
      errors.bio = `Bio must be no more than ${PROFILE_VALIDATION.BIO.max} characters`
    }

    // Location validation
    if (profileData.location.length > PROFILE_VALIDATION.LOCATION.max) {
      errors.location = `Location must be no more than ${PROFILE_VALIDATION.LOCATION.max} characters`
    }

    // Avatar URL validation
    if (profileData.avatarUrl) {
      if (profileData.avatarUrl.length > PROFILE_VALIDATION.AVATAR_URL.max) {
        errors.avatarUrl = `Avatar URL must be no more than ${PROFILE_VALIDATION.AVATAR_URL.max} characters`
      } else {
        // Basic URL validation
        try {
          new URL(profileData.avatarUrl)
        } catch {
          errors.avatarUrl = 'Please enter a valid URL'
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [])

  // Clear form errors
  const clearErrors = useCallback(() => {
    setFormErrors({})
  }, [])

  // Generate DID for current user
  const generateDID = useCallback((): string | null => {
    if (!address) return null
    return profileNFTService.generateDID(address)
  }, [address])

  // Create profile
  const createProfile = useCallback(async (profileData: ProfileData): Promise<ProfileCreationResult> => {
    if (!address) {
      return {
        success: false,
        error: 'Wallet not connected'
      }
    }

    // Validate form first
    if (!validateForm(profileData)) {
      return {
        success: false,
        error: 'Please fix form errors before submitting'
      }
    }

    try {
      setCreationState({ status: 'preparing' })

      // Create the profile
      const result = await profileNFTService.createBasicProfile(profileData, address)

      if (result.success) {
        setCreationState({ 
          status: 'success',
          hash: result.transactionHash,
          result: result  // Add this line
        })
        
        // Reload profile data
        await loadUserProfile()
        
        return result
      } else {
        setCreationState({ 
          status: 'error', 
          error: result.error || 'Profile creation failed'
        })
        return result
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setCreationState({ status: 'error', error: errorMessage })
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [address, validateForm, loadUserProfile])

  // Helper functions
  const getCreationFee = useCallback((): string => {
    return profileNFTService.getCreationFeeFormatted()
  }, [])

  const isFeeRequired = useCallback((): boolean => {
    return !qualificationStatus?.canBypassFee
  }, [qualificationStatus])

  const canBypassFee = qualificationStatus?.canBypassFee || false

  const getQualificationText = useCallback((): string => {
    if (!qualificationStatus) return 'Checking qualification...'
    if (qualificationStatus.canBypassFee) {
      return 'Qualified for free profile creation'
    }
    return `Fee required: ${getCreationFee()} FLOW`
  }, [qualificationStatus, getCreationFee])

  // Effects
  useEffect(() => {
    if (address && isConnected) {
      loadUserProfile()
      checkQualification()
    } else {
      setUserProfile(null)
      setQualificationStatus(null)
      setCreationState({ status: 'idle' })
    }
  }, [address, isConnected, loadUserProfile, checkQualification])

  // Computed values
  const isCreating = creationState.status === 'preparing' || creationState.status === 'pending'

  return {
    // Wallet state
    isConnected,
    address,
    connect,
    disconnect,
    
    // Profile state
    userProfile,
    isLoadingProfile,
    
    // Creation state
    creationState,
    isCreating,
    
    // Qualification state
    qualificationStatus,
    isCheckingQualification,
    canBypassFee,
    
    // Form validation
    formErrors,
    
    // Actions
    createProfile,
    checkQualification,
    validateForm,
    clearErrors,
    generateDID,
    
    // Helpers
    getCreationFee,
    isFeeRequired,
    getQualificationText
  }
}