'use client'

import { useState } from 'react'
import type { MintedBookmarkCollection } from '../../../../lib/types/mintedBookmark'

interface MintedBookmarkCardProps {
  collection: MintedBookmarkCollection
  onView?: (collectionId: string) => void
}

export default function MintedBookmarkCard({ collection, onView }: MintedBookmarkCardProps) {
  const handleView = () => {
    if (onView) {
      onView(collection.id)
    }
  }

  return (
    <div style={{
      background: 'var(--color-background)',
      border: '1px solid var(--color-border)', 
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem'
    }}>
      <h3>{collection.title}</h3>
      <p>NFT #{collection.tokenId}</p>
      <p>{collection.bookmarks.length} bookmarks</p>
      <button onClick={handleView}>View Collection</button>
    </div>
  )
}