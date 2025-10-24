// app/(client)/froth-comics/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { DAILY_WORDS } from '../../../lib/constants/wordBank';
import { allPanelsHaveWords } from '../../../lib/utils/wordValidation';
import { frothComicService } from '../../../lib/services/FrothComicDailyService';
import { ProfileNFTService } from '../../../lib/services/profile/ProfileNFT';
import type { DailyTemplate, SubmissionMetadata } from '../../../lib/types/frothComic';

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

// Helper to format time remaining
const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Closed";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

// Helper to truncate address
const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

// Loading Spinner Component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '1rem',
    padding: '2rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: '#666', fontSize: '14px' }}>{message}</p>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default function FrothComics() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  
  // Blockchain data
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [dailyTemplate, setDailyTemplate] = useState<DailyTemplate | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionMetadata[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading tournament data...");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [voting, setVoting] = useState<{ [tokenId: string]: boolean }>({});
  
  // Error states
  const [error, setError] = useState<string>("");
  
  // Visual selections (now initialized from template)
  const [selectedBackground, setSelectedBackground] = useState(0);
  const [selectedCharacters, setSelectedCharacters] = useState([0, 1, 2, 3]);
  const [wordCloudId] = useState(0);
  
  // Word bank system
  const [selectedPanel, setSelectedPanel] = useState(0);
  const [panelWordIndices, setPanelWordIndices] = useState<number[][]>([[], [], [], []]);
  const [usedWordIndices, setUsedWordIndices] = useState<Set<number>>(new Set());
  
  // UI states
  const [currentSubmission, setCurrentSubmission] = useState(0);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [claimableRewards, setClaimableRewards] = useState<{
    allDays?: Array<{
      day: number;
      creatorReward: number;
      voterReward: number;
      voterClaimed: boolean;
    }>;
    totalCreator?: number;
    totalVoter?: number;
  }>({});

  // Initialize wallet connection
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethersProvider = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(ethersProvider);
        
        const accounts = await ethersProvider.listAccounts();
        if (accounts.length > 0) {
          const userSigner = await ethersProvider.getSigner();
          setSigner(userSigner);
          setAddress(accounts[0].address);
        }
      }
    };
    
    initProvider();
  }, []);

  // Load tournament data
  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Loading tournament data...");
        
        // Initialize read-only service
        await frothComicService.initializeReadOnly();
        
        // Get current day
        const day = await frothComicService.getCurrentDay();
        setCurrentDay(day);
        
        // Get daily template
        const template = await frothComicService.getDailyTemplate(day);
        setDailyTemplate(template);
        
        // Set template characters and background
        setSelectedBackground(template.backgroundId);
        
        // Get submissions
        const subs = await frothComicService.getDaySubmissionsWithMetadata(day);
        setSubmissions(subs.sort((a, b) => b.votes - a.votes)); // Sort by votes
        
        // Calculate time remaining
        const remaining = await frothComicService.getTimeUntilClose(day);
        setTimeRemaining(remaining);
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading tournament data:", err);
        setError("Failed to load tournament data. Please refresh the page.");
        setLoading(false);
      }
    };
    
    loadTournamentData();
  }, []);

  // Check profile ownership when wallet connects
  useEffect(() => {
    const checkProfile = async () => {
      if (!address || !signer) return;
      
      try {
        const profileService = new ProfileNFTService();
        await profileService.initialize();
        const hasProf = await profileService.hasProfile(address);
        setHasProfile(hasProf);
        
        // Initialize froth service with wallet
        await frothComicService.initialize(signer);
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };
    
    checkProfile();
  }, [address, signer]);

  // Update countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Add word to active panel
  const handleAddWord = (wordIndex: number) => {
    if (panelWordIndices[selectedPanel].length >= 10) {
      setError("Maximum 10 words per panel!");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    const newPanelWords = [...panelWordIndices];
    newPanelWords[selectedPanel] = [...newPanelWords[selectedPanel], wordIndex];
    setPanelWordIndices(newPanelWords);
    
    setUsedWordIndices(new Set([...usedWordIndices, wordIndex]));
    setError("");
  };

  // Remove word from panel
  const handleRemoveWord = (panelId: number, position: number) => {
    const wordIndex = panelWordIndices[panelId][position];
    
    const newPanelWords = [...panelWordIndices];
    newPanelWords[panelId] = newPanelWords[panelId].filter((_, i) => i !== position);
    setPanelWordIndices(newPanelWords);
    
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

  // Handle comic submission
  const handleMint = async () => {
    if (!address || !signer) {
      setError("Please connect your wallet");
      return;
    }
    
    if (!hasProfile) {
      setError("You need an ImmutableType Profile to submit comics");
      return;
    }
    
    if (!allPanelsHaveWords(panelWordIndices)) {
      setError("All 4 panels must have at least 1 word!");
      return;
    }
    
    if (timeRemaining <= 0) {
      setError("Submissions are closed for this day");
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");
      
      setSubmitMessage("Approving 100 FROTH...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause for UX
      
      setSubmitMessage("Submitting your comic to the blockchain...");
      const tokenId = await frothComicService.submitEntry(panelWordIndices);
      
      setSubmitMessage("Success! Your comic has been minted 🎉");
      
      // Reset form
      setPanelWordIndices([[], [], [], []]);
      setUsedWordIndices(new Set());
      
      // Reload submissions
      const subs = await frothComicService.getDaySubmissionsWithMetadata(currentDay);
      setSubmissions(subs.sort((a, b) => b.votes - a.votes));
      
      setTimeout(() => {
        setSubmitting(false);
        setSubmitMessage("");
      }, 3000);
      
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit comic. Please try again.");
      setSubmitting(false);
      setSubmitMessage("");
    }
  };

  // Handle voting
  const handleVote = async (tokenId: string, amount: number) => {
    if (!address || !signer) {
      setError("Please connect your wallet to vote");
      return;
    }
    
    if (!dailyTemplate?.finalized && timeRemaining > 0) {
      setError("Voting opens after submission closes");
      return;
    }
    
    try {
      setVoting({ ...voting, [tokenId]: true });
      setError("");
      
      await frothComicService.vote(tokenId, amount);
      
      // Reload submissions to show updated votes
      const subs = await frothComicService.getDaySubmissionsWithMetadata(currentDay);
      setSubmissions(subs.sort((a, b) => b.votes - a.votes));
      
      setVoting({ ...voting, [tokenId]: false });
    } catch (err: any) {
      console.error("Voting error:", err);
      setError(err.message || "Failed to cast vote. Please try again.");
      setVoting({ ...voting, [tokenId]: false });
    }
  };

  const handleCheckRewards = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }
    
    setLoadingMessage("Scanning all past days for rewards...");
    
    try {
      const allRewards = [];
      
      // Scan from Day 0 to yesterday (currentDay - 1)
      for (let day = 0; day < currentDay; day++) {
        const rewards = await frothComicService.getClaimableRewards(address, day);
        const creatorAmount = parseFloat(ethers.formatUnits(rewards.creatorReward, 18));
        const voterAmount = parseFloat(ethers.formatUnits(rewards.voterReward, 18));
        
        // Only include days with claimable rewards
        if (creatorAmount > 0 || (voterAmount > 0 && !rewards.voterClaimed)) {
          allRewards.push({
            day,
            creatorReward: creatorAmount,
            voterReward: voterAmount,
            voterClaimed: rewards.voterClaimed
          });
        }
      }
      
      // Update state with all claimable rewards
      setClaimableRewards({
        allDays: allRewards,
        totalCreator: allRewards.reduce((sum, r) => sum + r.creatorReward, 0),
        totalVoter: allRewards.reduce((sum, r) => sum + (r.voterClaimed ? 0 : r.voterReward), 0)
      });
      
      setShowRewardsModal(true);
      setLoadingMessage("");
    } catch (err) {
      console.error("Error checking rewards:", err);
      setError("Failed to check rewards");
      setLoadingMessage("");
    }
  };

  // Claim rewards
  const handleClaimRewards = async (type: 'creator' | 'voter', dayId: number) => {
    if (!address || !signer) return;
    
    try {
      setLoadingMessage(`Claiming ${type} reward for Day ${dayId}...`);
      
      if (type === 'creator') {
        await frothComicService.claimCreatorReward(dayId);
      } else {
        await frothComicService.claimVoterReward(dayId);
      }
      
      setLoadingMessage("");
      
      // Refresh rewards after claiming
      await handleCheckRewards();
      
    } catch (err: any) {
      console.error("Claim error:", err);
      setError(err.message || "Failed to claim rewards");
      setLoadingMessage("");
    }
  };

  const nextSubmission = () => {
    setCurrentSubmission((prev) => (prev + 1) % submissions.length);
  };

  const prevSubmission = () => {
    setCurrentSubmission((prev) => (prev - 1 + submissions.length) % submissions.length);
  };

  // Get user's current words for preview
  const userPanelWords = getPanelWords(panelWordIndices);

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }

  // Show error if template failed to load
  if (!dailyTemplate) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Failed to Load Tournament</h2>
        <p>{error || "Unable to load tournament data"}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '2rem',
            padding: '1rem 2rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const totalPrizePool = Number(ethers.formatUnits(dailyTemplate.creatorPool + dailyTemplate.voterPool, 18));

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
            <div><strong>Day #{currentDay}</strong></div>
            <div>Prize Pool: <strong style={{ color: '#10b981' }}>{totalPrizePool.toFixed(0)} FROTH</strong></div>
            <div>
              Time Remaining: <strong style={{ color: timeRemaining <= 3600 ? '#ef4444' : '#666' }}>
                {formatTimeRemaining(timeRemaining)}
              </strong>
            </div>
            <div style={{ fontSize: '14px', color: '#888', marginTop: '0.5rem' }}>
              {Number(dailyTemplate.totalEntries)} submissions so far
            </div>
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

          {/* Check Rewards Button */}
          {address && (
            <button
              onClick={handleCheckRewards}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Check My Rewards 🎁
            </button>
          )}
        </div>

        {/* Leaderboard - Right Side */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🏆 Today's Leaderboard
          </h2>
          
          {submissions.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: '#f9fafb'
            }}>
              No submissions yet. Be the first! 🚀
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {submissions.slice(0, 3).map((sub, idx) => (
                  <div 
                    key={sub.tokenId}
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
                        {truncateAddress(sub.creator)}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>
                        {sub.votes} votes
                      </div>
                    </div>
                  </div>
                ))}
                
                {submissions.length > 3 && (
                  <button
                    onClick={() => setShowAllModal(true)}
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
                    View All {submissions.length} Submissions →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '1rem',
          background: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: '8px',
          color: '#991b1b',
          marginBottom: '2rem',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Profile Gate Warning */}
      {address && !hasProfile && (
        <div style={{
          padding: '1rem',
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          color: '#92400e',
          marginBottom: '2rem',
          fontSize: '14px'
        }}>
          ℹ️ You need an ImmutableType Profile to submit comics. <a href="/profile/create" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Create one here</a>
        </div>
      )}

      {/* Submission Loading State */}
      {submitting && (
        <div style={{
          padding: '2rem',
          background: '#fff',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <LoadingSpinner message={submitMessage} />
        </div>
      )}

      {/* Create Your Entry */}
      {!submitting && (
        <div style={{ 
          background: '#fff', 
          border: '2px solid #ddd', 
          borderRadius: '12px', 
          padding: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Create Your Entry
          </h2>

          {/* Template Info */}
          <div style={{
            padding: '1rem',
            background: '#f0f9ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontSize: '14px'
          }}>
  <strong>Today's Template:</strong> Background {selectedBackground} ({BACKGROUNDS[selectedBackground].name}) - Choose any characters you like!

          </div>

          {/* Build Your Story Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>
              Build Your Story
            </h3>

            {/* Panel Tab Selector */}
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



          {/* Character Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>
              Choose Your Characters
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '1rem',
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '500',
                    fontSize: '14px'
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
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      background: 'white',
                      fontSize: '14px',
                      cursor: 'pointer'
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
          </div>

          {/* Word Bank section continues below... */}



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

          {/* Word Packs Preview */}
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
              disabled={!address || !hasProfile || !allPanelsHaveWords(panelWordIndices) || timeRemaining <= 0}
              style={{
                width: '100%',
                padding: '1rem',
                background: (address && hasProfile && allPanelsHaveWords(panelWordIndices) && timeRemaining > 0) ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: (address && hasProfile && allPanelsHaveWords(panelWordIndices) && timeRemaining > 0) ? 'pointer' : 'not-allowed'
              }}
            >
              {!address 
                ? 'Connect Wallet to Mint' 
                : !hasProfile
                ? 'Create Profile to Submit'
                : timeRemaining <= 0
                ? 'Submissions Closed'
                : !allPanelsHaveWords(panelWordIndices)
                ? 'Add words to all 4 panels'
                : 'Mint Your Comic (100 FROTH)'}
            </button>
          </div>
        </div>
      )}

      {/* View All Submissions Modal */}
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
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '1200px',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
            width: '100%'
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
            
            <h2 style={{ marginBottom: '2rem' }}>All Submissions ({submissions.length})</h2>
            
            {submissions.map((sub, idx) => {
              const subWords = getPanelWords(sub.wordIndices);
              const isVoting = voting[sub.tokenId];
              
              return (
                <div key={sub.tokenId} style={{ marginBottom: '3rem', borderBottom: '1px solid #ddd', paddingBottom: '2rem' }}>
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>#{idx + 1}</strong> by {truncateAddress(sub.creator)} | <strong>{sub.votes} votes</strong>
                    </div>
                    
                    {/* Voting Controls */}
                    {address && timeRemaining <= 0 && !dailyTemplate.finalized && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleVote(sub.tokenId, 1)}
                          disabled={isVoting}
                          style={{
                            padding: '0.5rem 1rem',
                            background: isVoting ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isVoting ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          {isVoting ? 'Voting...' : 'Vote +1'}
                        </button>
                        <button
                          onClick={() => handleVote(sub.tokenId, 5)}
                          disabled={isVoting}
                          style={{
                            padding: '0.5rem 1rem',
                            background: isVoting ? '#9ca3af' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isVoting ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          {isVoting ? 'Voting...' : 'Vote +5'}
                        </button>
                      </div>
                    )}
                  </div>
                  <ComicStrip 
                    characterIds={sub.characterIds}
                    backgroundId={sub.backgroundId}
                    wordCloudId={wordCloudId}
                    panelWords={subWords}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

    {/* Rewards Modal */}
    {showRewardsModal && (
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
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
            width: '90%'
          }}>
            <button
              onClick={() => setShowRewardsModal(false)}
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
            
            <h2 style={{ marginBottom: '1.5rem' }}>Your Claimable Rewards 🎁</h2>
            
            {claimableRewards.allDays && claimableRewards.allDays.length === 0 ? (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: '#666',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                No rewards available yet. Keep creating and voting! 🚀
              </div>
            ) : (
              <>
                {/* Summary */}
                <div style={{
                  padding: '1.5rem',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  border: '2px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>
                    Total Claimable:
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <span style={{ color: '#10b981' }}>
                      {claimableRewards.totalCreator?.toFixed(2) || '0.00'} FROTH
                    </span>
                    {' '}
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      (Creator)
                    </span>
                    {(claimableRewards.totalVoter ?? 0) > 0 && (
                      <>
                        {' + '}
                        <span style={{ color: '#3b82f6' }}>
                          {claimableRewards.totalVoter?.toFixed(2)} FROTH
                        </span>
                        {' '}
                        <span style={{ fontSize: '14px', color: '#666' }}>
                          (Voter)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Day-by-day breakdown */}
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1rem' }}>
                  Rewards by Day:
                </div>
                
                {claimableRewards.allDays?.map((dayReward) => (
                  <div 
                    key={dayReward.day}
                    style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '0.75rem',
                      fontSize: '16px'
                    }}>
                      Day {dayReward.day}
                    </div>
                    
                    {/* Creator Reward */}
                    {dayReward.creatorReward > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              Creator Reward
                            </div>
                            <div style={{ 
                              fontSize: '1.25rem', 
                              fontWeight: 'bold', 
                              color: '#10b981' 
                            }}>
                              {dayReward.creatorReward.toFixed(2)} FROTH
                            </div>
                          </div>
                          <button
                            onClick={() => handleClaimRewards('creator', dayReward.day)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Claim Creator
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Voter Reward */}
                    {dayReward.voterReward > 0 && (
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              Voter Reward
                            </div>
                            <div style={{ 
                              fontSize: '1.25rem', 
                              fontWeight: 'bold', 
                              color: '#3b82f6' 
                            }}>
                              {dayReward.voterReward.toFixed(2)} FROTH
                            </div>
                          </div>
                          {dayReward.voterClaimed ? (
                            <div style={{
                              padding: '0.5rem 1rem',
                              color: '#666',
                              fontSize: '14px',
                              fontStyle: 'italic'
                            }}>
                              Already claimed ✓
                            </div>
                          ) : (
                            <button
                              onClick={() => handleClaimRewards('voter', dayReward.day)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              Claim Voter
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}