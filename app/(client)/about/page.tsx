'use client'

import { useEffect, useState } from 'react'

interface AboutSection {
  heading: string
  content: string
}

interface AboutContent {
  title: string
  subtitle: string
  sections: AboutSection[]
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent | null>(null)

  useEffect(() => {
    fetch('/about.json')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load about content:', err))
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
        
        {content.subtitle && (
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            {content.subtitle}
          </p>
        )}

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