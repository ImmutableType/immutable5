'use client'

import { useState } from 'react'
import { BookmarkItem } from '../../../../lib/types/bookmark'

interface ManualUrlEntryProps {
  onAdd: (item: BookmarkItem) => void
  onError: (error: string) => void
}

export default function ManualUrlEntry({ onAdd, onError }: ManualUrlEntryProps) {
  const [formData, setFormData] = useState({
    title: '',
    source: '',
    description: '',
    url: ''
  })
  const [isAdding, setIsAdding] = useState(false)

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const extractSourceFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'Unknown'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      onError('Title is required')
      return
    }
    
    if (!formData.url.trim()) {
      onError('URL is required')
      return
    }
    
    if (!validateUrl(formData.url)) {
      onError('Please enter a valid URL')
      return
    }

    setIsAdding(true)

    try {
      const source = formData.source.trim() || extractSourceFromUrl(formData.url)
      
      const newItem: BookmarkItem = {
        title: formData.title.trim(),
        source,
        description: formData.description.trim() || undefined,
        url: formData.url.trim()
      }

      onAdd(newItem)
      
      // Reset form
      setFormData({
        title: '',
        source: '',
        description: '',
        url: ''
      })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add bookmark'
      onError(errorMessage)
    } finally {
      setIsAdding(false)
    }
  }

  const handleClear = () => {
    setFormData({
      title: '',
      source: '',
      description: '',
      url: ''
    })
  }

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          
          {/* URL Field - Primary */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              URL *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com/article"
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: 'var(--text-base)',
                background: 'var(--color-white)'
              }}
              required
            />
          </div>

          {/* Title Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Article or page title"
              maxLength={200}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: 'var(--text-base)',
                background: 'var(--color-white)'
              }}
              required
            />
          </div>

          {/* Source Field - Optional */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Source <span style={{ color: 'var(--color-text-tertiary)' }}>(optional - auto-detected from URL)</span>
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              placeholder="example.com"
              maxLength={100}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: 'var(--text-base)',
                background: 'var(--color-white)'
              }}
            />
          </div>

          {/* Description Field - Optional */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.5rem'
            }}>
              Description <span style={{ color: 'var(--color-text-tertiary)' }}>(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the bookmark..."
              maxLength={500}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: 'var(--text-base)',
                background: 'var(--color-white)',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
            {formData.description && (
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: '0.25rem',
                textAlign: 'right'
              }}>
                {formData.description.length}/500
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            type="submit"
            disabled={isAdding || !formData.title.trim() || !formData.url.trim()}
            className="btn btn-primary"
            style={{
              minHeight: '44px',
              flex: '1',
              minWidth: '140px',
              opacity: isAdding || !formData.title.trim() || !formData.url.trim() ? 0.6 : 1,
              cursor: isAdding || !formData.title.trim() || !formData.url.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isAdding ? 'Adding...' : '+ Add Bookmark'}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            disabled={!formData.title && !formData.url && !formData.source && !formData.description}
            className="btn btn-secondary"
            style={{
              minHeight: '44px',
              opacity: !formData.title && !formData.url && !formData.source && !formData.description ? 0.6 : 1,
              cursor: !formData.title && !formData.url && !formData.source && !formData.description ? 'not-allowed' : 'pointer'
            }}
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* URL Preview */}
      {formData.url && validateUrl(formData.url) && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--color-slate-50)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px'
        }}>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            color: 'var(--color-text-secondary)',
            marginBottom: '0.5rem'
          }}>
            Preview
          </h4>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)'
          }}>
            <strong>{formData.title || 'Untitled'}</strong>
            {(formData.source || extractSourceFromUrl(formData.url)) && (
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {' '}— {formData.source || extractSourceFromUrl(formData.url)}
              </span>
            )}
            {formData.description && (
              <div style={{
                marginTop: '0.25rem',
                color: 'var(--color-text-tertiary)',
                fontStyle: 'italic'
              }}>
                "{formData.description}"
              </div>
            )}
            <div style={{
              marginTop: '0.25rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-primary-600)',
              fontFamily: 'var(--font-mono)',
              wordBreak: 'break-all'
            }}>
              {formData.url}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}