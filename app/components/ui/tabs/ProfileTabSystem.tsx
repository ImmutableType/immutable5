'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
  icon?: string
}

interface ProfileTabSystemProps {
  tabs: Tab[]
  defaultTab?: string
}

export default function ProfileTabSystem({ tabs, defaultTab }: ProfileTabSystemProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

  return (
    <div style={{ width: '100%' }}>
      {/* Tab Navigation */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '2rem'
      }}>
        <nav style={{
          display: 'flex',
          gap: '0',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                minHeight: '44px', // Touch-friendly
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: activeTab === tab.id ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minWidth: 'max-content'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }
              }}
            >
              {tab.icon && <span style={{ fontSize: '1rem' }}>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTabContent}
      </div>
    </div>
  )
}