// app/(client)/froth-comics/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { DAILY_WORDS, WORD_PACKS } from '../../../lib/constants/wordBank';
import { allPanelsHaveWords } from '../../../lib/utils/wordValidation';
import type { ComicSubmission } from '../../../lib/types/comic';
// Helper function to wrap text into lines
const wrapText = (text: string): string[] => {
  if (!text) return ['', '', ''];
  
  const maxChars = [22, 25, 23];
  const lines: string[] = [];
  let remainingText = text;
  
  for (let i = 0; i < 3; i++) {
    if (!remainingText) {
      lines.push('');
      continue;
    }
    
    const maxLength = maxChars[i];
    
    if (remainingText.length <= maxLength) {
      lines.push(remainingText);
      remainingText = '';
    } else {
      let breakPoint = remainingText.lastIndexOf(' ', maxLength);
      if (breakPoint === -1 || breakPoint < maxLength * 0.6) {
        breakPoint = maxLength;
      }
      
      lines.push(remainingText.substring(0, breakPoint).trim());
      remainingText = remainingText.substring(breakPoint).trim();
    }
  }
  
  return lines;
};

// Character data
const CHARACTERS = [
  { id: 0, name: "Base", file: "0-base.svg" },
  { id: 1, name: "Base R Space", file: "1-baseR-space.svg" },
  { id: 2, name: "Base L Space", file: "2-baseL-space.svg" },
  { id: 3, name: "RG Saucer", file: "3-RG-saucer.svg" },
  { id: 4, name: "Impact", file: "4-impact.svg" },
  { id: 5, name: "Mask L", file: "5-maskL.svg" },
  { id: 6, name: "Mask R", file: "6-maskR.svg" },
  { id: 7, name: "Froth R", file: "7-frothR.svg" },
  { id: 8, name: "Froth L", file: "8-frothL.svg" },
  { id: 9, name: "Buff R", file: "9-BuffR.svg" },
  { id: 10, name: "Buff L", file: "10-BuffL.svg" },
  { id: 11, name: "Block", file: "11-Block.svg" },
  { id: 12, name: "QWERTY", file: "12-QWERTY.svg" }
];

// Background data
const BACKGROUNDS = [
  { id: 0, name: "West", file: "0-west.svg" },
  { id: 1, name: "White", file: "1-white.svg" },
  { id: 2, name: "City", file: "2-city.svg" },
  { id: 3, name: "Space", file: "3-space.svg" },
  { id: 4, name: "Dark Space", file: "4-darkspace.svg" }
];

// Character component
const CharacterPlaceholder = ({ id, x = 0 }: { id: number; x?: number }) => {
  const character = CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
  
  return (
    <image 
      href={`/assets/comics/characters/${character.file}`}
      x={x + 40}
      y={140}
      width="300"
      height="300"
    />
  );
};

// Background component
const BackgroundPlaceholder = ({ id, x = 0 }: { id: number; x?: number }) => {
  const bg = BACKGROUNDS.find(b => b.id === id) || BACKGROUNDS[0];
  
  return (
    <image 
      href={`/assets/comics/backgrounds/${bg.file}`}
      x={x} 
      y={0}
      width="380" 
      height="380"
    />
  );
};

// Word Cloud component
const WordCloud = ({ id, x = 0 }: { id: number; x?: number }) => {
  return (
    <image 
      href={`/assets/comics/word-clouds/${id}-wordcloud.svg`}
      x={x + 20} 
      y={30}
      width="340" 
      height="100"
    />
  );
};

// Comic Panel Component with word rendering
const ComicPanel = ({ 
  characterId, 
  backgroundId,
  wordCloudId, 
  words,
  x = 0 
}: { 
  characterId: number; 
  backgroundId: number;
  wordCloudId: number;
  words: string[];
  x?: number 
}) => {
  const caption = words.join(' ');
  const lines = wrapText(caption);
  
  return (
    <g transform={`translate(${x}, 0)`}>
      {/* Border */}
      <rect width="380" height="380" fill="none" stroke="#000" strokeWidth="4" />
      
      {/* Layer 1: Background */}
      <BackgroundPlaceholder id={backgroundId} x={0} />
      
      {/* Layer 2: Character */}
      <CharacterPlaceholder id={characterId} x={0} />
      
      {/* Layer 3: Word Cloud */}
      <WordCloud id={wordCloudId} x={0} />
      
      // REPLACE LINES 140-175 (the text rendering section) WITH:

{/* Layer 4: Words (rendered as text) - CENTERED IN WORD CLOUD */}
{caption && (
  <g>
    <text 
      x="190" 
      y="70"
      textAnchor="middle" 
      fill="#000" 
      fontSize="14"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      {lines[0]}
    </text>
    <text 
      x="190" 
      y="86"
      textAnchor="middle" 
      fill="#000" 
      fontSize="14"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      {lines[1]}
    </text>
    <text 
      x="190" 
      y="102"
      textAnchor="middle" 
      fill="#000" 
      fontSize="14"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      {lines[2]}
    </text>
  </g>
)}

</g>
  );
};

// Full Comic Strip Component
const ComicStrip = ({ 
  characterIds, 
  backgroundId,
  wordCloudId,
  panelWords
}: { 
  characterIds: number[]; 
  backgroundId: number;
  wordCloudId: number;
  panelWords: string[][];
}) => {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 1600 400" 
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      <rect width="1600" height="400" fill="#f5f5f5" />
      <ComicPanel characterId={characterIds[0]} backgroundId={backgroundId} wordCloudId={wordCloudId} words={panelWords[0]} x={10} />
      <ComicPanel characterId={characterIds[1]} backgroundId={backgroundId} wordCloudId={wordCloudId} words={panelWords[1]} x={410} />
      <ComicPanel characterId={characterIds[2]} backgroundId={backgroundId} wordCloudId={wordCloudId} words={panelWords[2]} x={810} />
      <ComicPanel characterId={characterIds[3]} backgroundId={backgroundId} wordCloudId={wordCloudId} words={panelWords[3]} x={1210} />
    </svg>
  );
};

export default function FrothComics() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  
  // Visual selections
  const [selectedBackground, setSelectedBackground] = useState(0);
  const [selectedCharacters, setSelectedCharacters] = useState([0, 1, 2, 3]);
  const [wordCloudId] = useState(0);
  
  // Word bank system
  const [selectedPanel, setSelectedPanel] = useState(0); // Active panel (0-3)
  const [panelWordIndices, setPanelWordIndices] = useState<number[][]>([[], [], [], []]); // Word indices per panel
  const [usedWordIndices, setUsedWordIndices] = useState<Set<number>>(new Set()); // Track used words
  
  // Mock submissions with word indices
  const [submissions] = useState([
    { 
      id: 1, 
      creator: "0xABC...123", 
      votes: 47,
      characterIds: [0, 7, 1, 9],
      backgroundId: 3,
      wordCloudId: 0,
      wordIndices: [[0, 10, 5], [9, 1, 11], [8, 12, 6], [2, 7, 13]] // "the run happy suddenly..."
    },
    { 
      id: 2, 
      creator: "0xDEF...456", 
      votes: 32,
      characterIds: [5, 6, 8, 10],
      backgroundId: 2,
      wordCloudId: 0,
      wordIndices: [[3, 14, 15], [16, 17, 18], [19, 20, 21], [22, 23, 24]]
    },
    { 
      id: 3, 
      creator: "0xGHI...789", 
      votes: 28,
      characterIds: [11, 12, 4, 3],
      backgroundId: 4,
      wordCloudId: 0,
      wordIndices: [[25, 26, 27], [28, 29, 30], [31, 32, 33], [34, 35, 36]]
    }
  ]);
  
  const [currentSubmission, setCurrentSubmission] = useState(0);
  const [showAllModal, setShowAllModal] = useState(false);

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethersProvider = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(ethersProvider);
        
        const accounts = await ethersProvider.listAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0].address);
        }
      }
    };
    
    initProvider();
  }, []);

  // Add word to active panel
  const handleAddWord = (wordIndex: number) => {
    // Check if panel is full
    if (panelWordIndices[selectedPanel].length >= 10) {
      alert("Maximum 10 words per panel!");
      return;
    }
    
    // Add word to panel
    const newPanelWords = [...panelWordIndices];
    newPanelWords[selectedPanel] = [...newPanelWords[selectedPanel], wordIndex];
    setPanelWordIndices(newPanelWords);
    
    // Mark word as used
    setUsedWordIndices(new Set([...usedWordIndices, wordIndex]));
  };

  // Remove word from panel
  const handleRemoveWord = (panelId: number, position: number) => {
    const wordIndex = panelWordIndices[panelId][position];
    
    // Remove from panel
    const newPanelWords = [...panelWordIndices];
    newPanelWords[panelId] = newPanelWords[panelId].filter((_, i) => i !== position);
    setPanelWordIndices(newPanelWords);
    
    // Mark as available again
    const newUsed = new Set(usedWordIndices);
    newUsed.delete(wordIndex);
    setUsedWordIndices(newUsed);
  };

  // Convert word indices to actual words for display
  const getPanelWords = (indices: number[][]): string[][] => {
    return indices.map(panelIndices => 
      panelIndices.map(idx => DAILY_WORDS[idx] || '')
    );
  };

  const nextSubmission = () => {
    setCurrentSubmission((prev) => (prev + 1) % submissions.length);
  };

  const prevSubmission = () => {
    setCurrentSubmission((prev) => (prev - 1 + submissions.length) % submissions.length);
  };

  const handleMint = async () => {
    if (!address) {
      alert("Please connect wallet");
      return;
    }
    
    if (!allPanelsHaveWords(panelWordIndices)) {
      alert("All 4 panels must have at least 1 word!");
      return;
    }
    
    const submissionData: ComicSubmission = {
      characterIds: selectedCharacters,
      backgroundId: selectedBackground,
      wordCloudId: wordCloudId,
      wordIndices: panelWordIndices
    };
    
    console.log('Minting comic:', submissionData);
    alert(`Ready to mint!\n\nCharacters: ${selectedCharacters.join(', ')}\nBackground: ${selectedBackground}\nWords per panel: ${panelWordIndices.map(p => p.length).join(', ')}`);
    // TODO: Contract integration
  };

  // Get current submission words for display
  const currentSubmissionWords = getPanelWords(submissions[currentSubmission].wordIndices);
  
  // Get user's current words for preview
  const userPanelWords = getPanelWords(panelWordIndices);

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>


{/* Header + Leaderboard Row */}
<div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '2rem', 
      marginBottom: '3rem',
      background: '#fff',
      border: '2px solid #ddd',
      borderRadius: '12px',
      padding: '2rem'
    }}>




{/* Tournament Info - Left Side */}
<div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          FROTH Daily Comic Tournament
        </h1>
        <div style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          <div><strong>Day #47</strong></div>
          <div>Prize Pool: <strong style={{ color: '#10b981' }}>15,200 FROTH</strong></div>
          <div>Time Remaining: <strong style={{ color: '#ef4444' }}>8h 42m</strong></div>
        </div>

        {/* Entry Cost Breakdown */}
        <div style={{ 
          background: '#f9fafb', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Entry Cost: 100 FROTH
          </div>
          <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '1.5rem', margin: 0 }}>
            <li>60 FROTH → Treasury (converts to FVIX)</li>
            <li>20 FROTH → Creator Prize Pool</li>
            <li>20 FROTH → Voter Prize Pool</li>
          </ul>
        </div>
      </div>






      {/* Leaderboard - Right Side */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🏆 Today's Leaderboard
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {submissions.slice(0, 3).map((sub, idx) => (
            <div 
              key={sub.id}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '0.75rem',
                background: idx === 0 ? '#fef3c7' : '#f9fafb',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            >
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: idx === 0 ? '#f59e0b' : '#666',
                minWidth: '30px'
              }}>
                #{idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {sub.creator}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
                  {sub.votes} votes
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => alert('Navigate to Reader - Coming in Phase 2')}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            View All Submissions →
          </button>
        </div>
      </div>
    </div>










    {/* Create Your Entry */}
    <div style={{ 
        background: '#fff', 
        border: '2px solid #ddd', 
        borderRadius: '12px', 
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Create Your Entry
        </h2>

        {/* Background Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            Choose Background
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {BACKGROUNDS.map(bg => (
              <button
                key={bg.id}
                onClick={() => setSelectedBackground(bg.id)}
                style={{
                  width: '120px',
                  height: '120px',
                  border: selectedBackground === bg.id ? '4px solid #3b82f6' : '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  background: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={`/assets/comics/backgrounds/${bg.file}`}
                  alt={bg.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  {bg.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Build Your Story Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            Build Your Story
          </h3>

          {/* Panel Tab Selector - MOVED ABOVE PREVIEW */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[0, 1, 2, 3].map(i => (
              <button
                key={i}
                onClick={() => setSelectedPanel(i)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: selectedPanel === i ? '#3b82f6' : '#f3f4f6',
                  color: selectedPanel === i ? 'white' : '#000',
                  border: '2px solid',
                  borderColor: selectedPanel === i ? '#3b82f6' : '#ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Panel {i + 1}
                <br />
                <small>({panelWordIndices[i].length}/10 words)</small>
              </button>
            ))}
          </div>

          {/* Live Preview */}
          <ComicStrip 
            characterIds={selectedCharacters}
            backgroundId={selectedBackground}
            wordCloudId={wordCloudId}
            panelWords={userPanelWords}
          />

          {/* Character Dropdowns - DIRECTLY UNDER EACH PANEL */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontSize: '12px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  Panel {i + 1} Character:
                </label>
                <select
                  value={selectedCharacters[i]}
                  onChange={e => {
                    const newChars = [...selectedCharacters];
                    newChars[i] = parseInt(e.target.value);
                    setSelectedCharacters(newChars);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  {CHARACTERS.map(char => (
                    <option key={char.id} value={char.id}>
                      {char.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Active Panel Word Management */}
          <div style={{ 
            marginTop: '2rem',
            border: '2px solid #3b82f6', 
            borderRadius: '8px', 
            padding: '1.5rem',
            background: '#f0f9ff'
          }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>
              Panel {selectedPanel + 1} - Words ({panelWordIndices[selectedPanel].length}/10)
            </h4>
            
            {/* Word List for Active Panel */}
            <div style={{ 
              minHeight: '60px',
              padding: '0.75rem',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              {panelWordIndices[selectedPanel].length === 0 ? (
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                  Click words below to add them here...
                </span>
              ) : (
                panelWordIndices[selectedPanel].map((wordIdx, pos) => (
                  <button
                    key={pos}
                    onClick={() => handleRemoveWord(selectedPanel, pos)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {DAILY_WORDS[wordIdx]}
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>✕</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>



        {/* Word Bank */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            FROTH Word Bank (Click to add to Panel {selectedPanel + 1})
          </h3>
          <div style={{ 
  display: 'flex', 
  flexWrap: 'wrap', 
  gap: '0.5rem',
  padding: '1.5rem',
  background: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #ddd'
}}>
            {DAILY_WORDS.map((word: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAddWord(index)}
                disabled={usedWordIndices.has(index)}
                style={{
                  padding: '0.5rem 1rem',
                  background: usedWordIndices.has(index) ? '#e5e7eb' : '#3b82f6',
                  color: usedWordIndices.has(index) ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: usedWordIndices.has(index) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: usedWordIndices.has(index) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {word}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>
            {usedWordIndices.size} / {DAILY_WORDS.length} words used
          </p>
        </div>

        {/* Word Packs Preview - FROTH Pack Included! */}
<div style={{ marginBottom: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #10b981' }}>
  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 'bold', color: '#10b981' }}>
    ✓ FROTH Essentials Pack - Included Free!
  </h3>
  <p style={{ fontSize: '14px', color: '#666', marginBottom: '0.75rem' }}>
    You have access to 18 official KittyPunch ecosystem terms: Punch, PunchSwap, FVIX, Trenches, Vaults, and more!
  </p>
  
  <div style={{ fontSize: '12px', color: '#888', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
    <strong>Additional packs coming soon:</strong> Degen Starter, Flow Culture, Market Master, Tournament Pro
  </div>
</div>


        {/* Mint Section */}
        <div style={{ 
          background: '#f9fafb', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1.5rem',
          marginBottom: '1rem'
        }}>
         



        <button
          onClick={handleMint}
          disabled={!address || !allPanelsHaveWords(panelWordIndices)}
          style={{
            width: '100%',
            padding: '1rem',
            background: address && allPanelsHaveWords(panelWordIndices) ? '#10b981' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: address && allPanelsHaveWords(panelWordIndices) ? 'pointer' : 'not-allowed'
          }}
        >
          {!address 
            ? 'Connect Wallet to Mint' 
            : !allPanelsHaveWords(panelWordIndices)
            ? 'Add words to all 4 panels'
            : 'Mint Your Comic (100 FROTH)'}
        </button>
      </div>
      </div>

      {/* View All Modal */}
      {showAllModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '900px',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAllModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ marginBottom: '2rem' }}>All Submissions</h2>
            
            {submissions.map((sub, idx) => {
              const subWords = getPanelWords(sub.wordIndices);
              return (
                <div key={sub.id} style={{ marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '2rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>#{idx + 1}</strong> by {sub.creator} | {sub.votes} votes
                  </div>
                  <ComicStrip 
                    characterIds={sub.characterIds}
                    backgroundId={sub.backgroundId}
                    wordCloudId={sub.wordCloudId}
                    panelWords={subWords}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}