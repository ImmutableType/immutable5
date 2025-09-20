'use client'

import { BookmarkCollection, BookmarkItem } from '../../../../lib/types/bookmark'

interface BookmarkCardProps {
    collection: BookmarkCollection
    onView?: (collection: BookmarkCollection) => void
    onEdit?: (collection: BookmarkCollection) => void
    onDelete?: (collection: BookmarkCollection) => void
  }

export default function BookmarkCard({ collection, onView, onEdit, onDelete }: BookmarkCardProps) {
  const previewItems = collection.items.slice(0, 3)
  const hasMoreItems = collection.items.length > 3

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '1.5rem',
      background: 'var(--color-white)',
      transition: 'all 0.2s ease',
      cursor: onView ? 'pointer' : 'default'
    }}
    onClick={() => onView?.(collection)}
    onMouseEnter={(e) => {
      if (onView) {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }
    }}
    onMouseLeave={(e) => {
      if (onView) {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }
    }}
    >
      {/* Collection Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
          lineHeight: '1.4'
        }}>
          {collection.title}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          flexWrap: 'wrap'
        }}>
          <span>📅 {collection.date}</span>
          <span>🔗 {collection.items.length} bookmark{collection.items.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Preview Items */}
      <div style={{ marginBottom: '1rem' }}>
        {previewItems.map((item: BookmarkItem, index: number) => (
          <div key={index} style={{
            padding: '0.75rem 0',
            borderBottom: index < previewItems.length - 1 ? '1px solid var(--color-slate-100)' : 'none'
          }}>
            <div style={{
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--color-text-primary)',
              marginBottom: '0.25rem',
              lineHeight: '1.4'
            }}>
              {item.title}
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span>🌐 {item.source}</span>
              {item.description && (
                <span style={{
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  • {item.description}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {hasMoreItems && (
          <div style={{
            padding: '0.75rem 0',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-primary-600)',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            +{collection.items.length - 3} more bookmarks
          </div>
        )}
      </div>

      {/* Actions */}
      {(onView || onEdit || onDelete) && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-slate-100)',
          flexWrap: 'wrap'
        }}>
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView(collection)
              }}
              style={{
                minHeight: '44px',
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--color-primary-600)',
                background: 'var(--color-primary-50)',
                border: '1px solid var(--color-primary-200)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: '1'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-100)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-50)'
              }}
            >
              View All
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(collection)
              }}
              style={{
                minHeight: '44px',
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--color-slate-600)',
                background: 'var(--color-slate-50)',
                border: '1px solid var(--color-slate-200)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: '1'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-slate-100)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-slate-50)'
              }}
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(collection)
              }}
              style={{
                minHeight: '44px',
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--color-red-600)',
                background: 'var(--color-red-50)',
                border: '1px solid var(--color-red-200)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: '1'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-red-100)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-red-50)'
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}