'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useDirectWallet } from '../../../lib/hooks/useDirectWallet'
import { tokenQualifierService } from '../../../lib/services/profile/TokenQualifier'
import confetti from 'canvas-confetti'
import Image from 'next/image'

type AuthMethod = 'wallet' | null

interface FormData {
  displayName: string
  bio: string
  location: string
  avatarUrl: string
}

interface CreationState {
  status: 'idle' | 'preparing' | 'pending' | 'success' | 'error'
  error?: string
  result?: {
    profileId: string
    did: string
    transactionHash?: string
  }
}

interface QualificationStatus {
  isQualified: boolean
  tokenBalance: string
  nftCount: number
  canBypassFee: boolean
}

const CreateProfilePage: React.FC = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'lime', 
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: 'black'
    }}>
      MOBILE TEST - Can you see this green screen?
    </div>
  )
}

export default CreateProfilePage