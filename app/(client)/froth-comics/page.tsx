// app/(client)/froth-comics/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Helper function to wrap text into lines
const wrapText = (text: string): string[] => {
  if (!text) return ['', '', ''];
  
  const maxChars = [22, 25, 23]; // Characters per line
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
      // Try to break at a space
      let breakPoint = remainingText.lastIndexOf(' ', maxLength);
      if (breakPoint === -1 || breakPoint < maxLength * 0.6) {
        // No good space found, hard break
        breakPoint = maxLength;
      }
      
      lines.push(remainingText.substring(0, breakPoint).trim());
      remainingText = remainingText.substring(breakPoint).trim();
    }
  }
  
  return lines;
};

// Character component - now loads your actual SVGs
const CharacterPlaceholder = ({ id, x = 0 }: { id: number; x?: number }) => {
  const characterFiles = [
    "0-base.svg",
    "1-baseR-space.svg",
    "2-baseL-space.svg",
    "3-RG-saucer.svg",
    "4-impact.svg",
    "5-maskL.svg",
    "6-maskR.svg",
    "7-frothR.svg",
    "8-frothL.svg",
    "9-BuffR.svg",
    "10-BuffL.svg",
    "11-Block.svg",
    "12-QWERTY.svg"
  ];
  
  const file = characterFiles[id] || characterFiles[0];
  
  return (
    <image 
      href={`/assets/comics/characters/${file}`}
      x={x} 
      y={20}
      width="380" 
      height="340"
    />
  );
};

// Background component
const BackgroundPlaceholder = ({ id, x = 0 }: { id: number; x?: number }) => {
  const backgrounds = [
    { name: "West", file: "0-west.svg" },
    { name: "White", file: "1-white.svg" },
    { name: "City", file: "2-city.svg" },
    { name: "Space", file: "3-space.svg" },
    { name: "Dark Space", file: "4-darkspace.svg" }
  ];
  
  const bg = backgrounds[id] || backgrounds[0];
  
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
      y={260}
      width="340" 
      height="100"
    />
  );
};

// Comic Panel Component with multi-line text
const ComicPanel = ({ 
  characterId, 
  backgroundId,
  wordCloudId, 
  caption, 
  x = 0 
}: { 
  characterId: number; 
  backgroundId: number;
  wordCloudId: number;
  caption: string; 
  x?: number 
}) => {
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
      
      {/* Layer 4: Caption Text (multi-line, on top of word cloud) */}
      {caption && (
        <g>
          <text 
            x="190" 
            y="295" 
            textAnchor="middle" 
            fill="#000" 
            fontSize="16"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
          >
            {lines[0]}
          </text>
          <text 
            x="190" 
            y="315" 
            textAnchor="middle" 
            fill="#000" 
            fontSize="16"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
          >
            {lines[1]}
          </text>
          <text 
            x="190" 
            y="335" 
            textAnchor="middle" 
            fill="#000" 
            fontSize="16"
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
  captions 
}: { 
  characterIds: number[]; 
  backgroundId: number;
  wordCloudId: number;
  captions: string[] 
}) => {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 1600 400" 
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      <rect width="1600" height="400" fill="#f5f5f5" />
      <ComicPanel characterId={characterIds[0]} backgroundId={backgroundId} wordCloudId={wordCloudId} caption={captions[0]} x={10} />
      <ComicPanel characterId={characterIds[1]} backgroundId={backgroundId} wordCloudId={wordCloudId} caption={captions[1]} x={410} />
      <ComicPanel characterId={characterIds[2]} backgroundId={backgroundId} wordCloudId={wordCloudId} caption={captions[2]} x={810} />
      <ComicPanel characterId={characterIds[3]} backgroundId={backgroundId} wordCloudId={wordCloudId} caption={captions[3]} x={1210} />
    </svg>
  );
};

// Helper function to generate daily template
const generateDailyTemplate = (dayId: number) => {
  // Seed random number generator with day ID for consistency
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Generate 4 random character IDs (0-12)
  const characterIds = [
    Math.floor(seededRandom(dayId * 1) * 13),
    Math.floor(seededRandom(dayId * 2) * 13),
    Math.floor(seededRandom(dayId * 3) * 13),
    Math.floor(seededRandom(dayId * 4) * 13)
  ];
  
  // Background rotates through 0-4
  const backgroundId = dayId % 5;
  
  // Word cloud rotates through 0-4
  const wordCloudId = dayId % 5;
  
  return {
    dayId,
    characterIds,
    backgroundId,
    wordCloudId
  };
};

export default function FrothComics() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  
  // Generate today's template based on day ID
  const [todayTemplate] = useState(() => {
    const template = generateDailyTemplate(47);
    return {
      ...template,
      prizePool: 15200,
      submissions: 23,
      timeRemaining: "8h 42m"
    };
  });
  
  // Mock submissions for carousel
  const [submissions] = useState([
    { id: 1, creator: "0xABC...123", votes: 47, captions: ["Wen moon?", "Soon ser", "Trust me bro", "WAGMI"] },
    { id: 2, creator: "0xDEF...456", votes: 32, captions: ["GM frens", "Stack FROTH", "To infinity", "LFG!"] },
    { id: 3, creator: "0xGHI...789", votes: 28, captions: ["Bear market", "Keep building", "Still here", "HODL"] }
  ]);
  
  const [currentSubmission, setCurrentSubmission] = useState(0);
  const [userCaptions, setUserCaptions] = useState(["", "", "", ""]);
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
    
    alert(`Minting comic with captions: ${userCaptions.join(' | ')}`);
    // TODO: Contract integration
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          FROTH Daily Comic Challenge
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          Day #{todayTemplate.dayId}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
          <div>Prize Pool: <strong>{todayTemplate.prizePool} FROTH</strong></div>
          <div>Submissions: <strong>{todayTemplate.submissions}</strong></div>
          <div>Time Remaining: <strong>{todayTemplate.timeRemaining}</strong></div>
        </div>
      </div>

      {/* Carousel Section */}
      <div style={{ 
        background: '#fff', 
        border: '2px solid #ddd', 
        borderRadius: '12px', 
        padding: '2rem',
        marginBottom: '3rem',
        position: 'relative'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          Today's Submissions
        </h2>
        
        {/* Carousel Navigation */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={prevSubmission}
            style={{
              position: 'absolute',
              left: '-60px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '3rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            ←
          </button>
          
          <div style={{ margin: '0 auto' }}>
            <ComicStrip 
              characterIds={todayTemplate.characterIds}
              backgroundId={todayTemplate.backgroundId}
              wordCloudId={todayTemplate.wordCloudId}
              captions={submissions[currentSubmission].captions}
            />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p>By {submissions[currentSubmission].creator} | {submissions[currentSubmission].votes} votes</p>
            </div>
          </div>
          
          <button
            onClick={nextSubmission}
            style={{
              position: 'absolute',
              right: '-60px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '3rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            →
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => setShowAllModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            View All Submissions ({submissions.length})
          </button>
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

        {/* Live Preview */}
        <div style={{ marginBottom: '2rem' }}>
          <ComicStrip 
            characterIds={todayTemplate.characterIds}
            backgroundId={todayTemplate.backgroundId}
            wordCloudId={todayTemplate.wordCloudId}
            captions={userCaptions}
          />
        </div>
        
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Panel {i + 1} Caption (50 characters max)
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder={`Enter text for panel ${i + 1}...`}
                value={userCaptions[i]}
                onChange={e => {
                  const newCaptions = [...userCaptions];
                  newCaptions[i] = e.target.value;
                  setUserCaptions(newCaptions);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
          ))}
        </div>

        {/* Mint Section */}
        <div style={{ 
          background: '#f9fafb', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Cost: 100 FROTH</strong>
          </div>
          <ul style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
            <li>60 FROTH → Treasury (converts to FVIX)</li>
            <li>20 FROTH → Creator Prize Pool</li>
            <li>20 FROTH → Voter Prize Pool</li>
          </ul>
        </div>

        <button
          onClick={handleMint}
          disabled={!address || userCaptions.every(c => !c)}
          style={{
            width: '100%',
            padding: '1rem',
            background: address && !userCaptions.every(c => !c) ? '#10b981' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: address && !userCaptions.every(c => !c) ? 'pointer' : 'not-allowed'
          }}
        >
          {address ? 'Mint Your Comic (100 FROTH)' : 'Connect Wallet to Mint'}
        </button>
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
            maxWidth: '800px',
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
            
            <h2 style={{ marginBottom: '2rem' }}>All Submissions (Day #{todayTemplate.dayId})</h2>
            
            {submissions.map((sub, idx) => (
              <div key={sub.id} style={{ marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>#{idx + 1}</strong> by {sub.creator} | {sub.votes} votes
                </div>
                <ComicStrip 
                  characterIds={todayTemplate.characterIds}
                  backgroundId={todayTemplate.backgroundId}
                  wordCloudId={todayTemplate.wordCloudId}
                  captions={sub.captions}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}