'use client'

import { useEffect, useState, useCallback } from 'react'
import { mintedBookmarkService } from '../../../../lib/services/blockchain/MintedBookmarkService'
import MintedBookmarkCard from '../../ui/cards/MintedBookmarkCard'
import type { MintedBookmarkDisplayData, MintedBookmarkCollection } from '../../../../lib/types/mintedBookmark'

interface MintedBookmarksProps {
  profileId: string
}

export default function MintedBookmarks({ profileId }: MintedBookmarksProps) {
  const [data, setData] = useState<MintedBookmarkDisplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMintedBookmarks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const mintedData = await mintedBookmarkService.getMintedBookmarksByProfile(profileId)
      setData(mintedData)
      
    } catch (err: unknown) {
      console.error('Error loading minted bookmarks:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load minted bookmarks'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [profileId])

  const handleViewCollection = (collectionId: string) => {
    console.log('View collection:', collectionId)
  }

  useEffect(() => {
    loadMintedBookmarks()
  }, [loadMintedBookmarks])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: 'var(--text-base)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid var(--color-primary-200)',
            borderTop: '2px solid var(--color-primary-600)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading minted bookmark collections...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--color-red-50)',
        border: '1px solid var(--color-red-200)',
        borderRadius: '8px',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <div style={{
          color: 'var(--color-red-600)',
          fontWeight: '600',
          marginBottom: '0.5rem'
        }}>
          Error Loading Collections
        </div>
        <div style={{
          color: 'var(--color-red-700)',
          fontSize: 'var(--text-sm)'
        }}>
          {error}
        </div>
      </div>
    )
  }

  if (!data || data.collections.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          📚
        </div>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem'
        }}>
          No Minted Collections Yet
        </h3>
        <p style={{
          fontSize: 'var(--text-base)',
          lineHeight: '1.6',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          This profile hasn't minted any bookmark collections to the blockchain yet. 
          Collections will appear here once they're published as NFTs.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ 
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem'
        }}>
          Minted Bookmark Collections
        </h2>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-base)',
          marginBottom: '1rem'
        }}>
          {data.totalCount} collection{data.totalCount !== 1 ? 's' : ''} minted as NFTs on Flow EVM
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-tertiary)'
        }}>
          <span>
            📊 Total Bookmarks: {data.collections.reduce((sum: number, col: MintedBookmarkCollection) => sum + col.bookmarks.length, 0)}
          </span>
          <span>
            🔗 Profile: {data.profileOwner}
          </span>
        </div>
      </div>

      <div>
        {data.collections.map((collection: MintedBookmarkCollection) => (
          <MintedBookmarkCard
            key={collection.id}
            collection={collection}
            onView={handleViewCollection}
          />
        ))}
      </div>
    </div>
  )
}