'use client'

import { useState, useEffect } from 'react'

interface Question {
  id: string
  question: string
  answer: string
}

interface Category {
  category: string
  icon: string
  questions: Question[]
}

interface FAQData {
  title: string
  subtitle: string
  lastUpdated: string
  categories: Category[]
}

export default function FAQPage() {
  const [faqData, setFaqData] = useState<FAQData | null>(null)
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set())
  const [allOpen, setAllOpen] = useState(false)

  useEffect(() => {
    fetch('/faq.json')
      .then(res => res.json())
      .then(data => setFaqData(data))
      .catch(err => console.error('Failed to load FAQ data:', err))
  }, [])

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions(prev => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  const toggleAllQuestions = () => {
    if (allOpen) {
      setOpenQuestions(new Set())
      setAllOpen(false)
    } else {
      const allQuestionIds = new Set<string>()
      faqData?.categories.forEach(category => {
        category.questions.forEach(q => allQuestionIds.add(q.id))
      })
      setOpenQuestions(allQuestionIds)
      setAllOpen(true)
    }
  }

  // Function to parse answer text and convert HTML links to proper elements
  const renderAnswer = (answer: string) => {
    return <div dangerouslySetInnerHTML={{ __html: answer }} />
  }

  if (!faqData) {
    return (
      <div className="faq-page">
        <div className="faq-loading">Loading FAQ...</div>
      </div>
    )
  }

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>{faqData.title}</h1>
        <p className="faq-subtitle">{faqData.subtitle}</p>
        <p className="faq-last-updated">Last updated: {faqData.lastUpdated}</p>
      </div>

      <div className="faq-controls">
        <button 
          onClick={toggleAllQuestions}
          className="faq-toggle-all-btn"
        >
          {allOpen ? 'Close All' : 'Open All'}
        </button>
      </div>

      <div className="faq-categories">
        {faqData.categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="faq-category">
            <h2 className="faq-category-title">
              <span className="faq-category-icon">{category.icon}</span>
              {category.category}
            </h2>
            
            <div className="faq-questions">
              {category.questions.map((question) => {
                const isOpen = openQuestions.has(question.id)
                return (
                  <div 
                    key={question.id} 
                    className={`faq-question-item ${isOpen ? 'open' : ''}`}
                  >
                    <button
                      onClick={() => toggleQuestion(question.id)}
                      className="faq-question-button"
                      aria-expanded={isOpen}
                    >
                      <span className="faq-question-text">{question.question}</span>
                      <span className="faq-question-icon">
                        {isOpen ? '▼' : '▶'}
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="faq-answer">
                        {renderAnswer(question.answer)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}