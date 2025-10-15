'use client'

import { useEffect, useState } from 'react'

interface RoadmapSection {
  heading: string
  content: string
}

interface RoadmapContent {
  title: string
  sections: RoadmapSection[]
}

export default function RoadmapPage() {
  const [content, setContent] = useState<RoadmapContent | null>(null)

  useEffect(() => {
    fetch('/roadmap.json')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load roadmap content:', err))
  }, [])

  if (!content) {
    return (
      <div className="profile-container">
        <div className="profile-card profile-card-wide" style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-card profile-card-wide" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h1 className="profile-title">{content.title}</h1>

        <div style={{ 
          color: 'var(--color-text-primary)',
          lineHeight: '1.8',
          fontSize: 'var(--text-base)'
        }}>
          {content.sections.map((section, index) => (
            <section key={index} style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: '600',
                marginBottom: '1rem',
                color: 'var(--color-text-primary)'
              }}>
                {section.heading}
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}