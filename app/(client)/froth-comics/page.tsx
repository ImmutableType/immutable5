// app/(client)/froth-comics/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { DAILY_WORDS } from '../../../lib/constants/wordBank';
import { allPanelsHaveWords } from '../../../lib/utils/wordValidation';
import { frothComicService } from '../../../lib/services/FrothComicService';
import { ProfileNFTService } from '../../../lib/services/profile/ProfileNFT';
import type { DayInfo, Comic, ComicSlotInfo } from '../../../lib/services/FrothComicService';

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
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null);
  const [submissions, setSubmissions] = useState<Comic[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [slotInfo, setSlotInfo] = useState<ComicSlotInfo | null>(null);
  const [lastVoteUpdate, setLastVoteUpdate] = useState<Date>(new Date());
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading tournament data...");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [voting, setVoting] = useState<{ [tokenId: string]: boolean }>({});
  const [enteringTournament, setEnteringTournament] = useState<boolean>(false);
  const [updatingVotes, setUpdatingVotes] = useState<boolean>(false);
  
  // Error states
  const [error, setError] = useState<string>("");
  
  // Visual selections
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
  const [claimableRewards, setClaimableRewards] = useState({ creator: "0", voter: "0", claimed: false });

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
        
        // Get current day
        const day = await frothComicService.getCurrentDay();
        setCurrentDay(day);
        
        // Get day info
        const info = await frothComicService.getDayInfo(day);
        setDayInfo(info);
        
        // Get submissions
        const comics = await frothComicService.getDayComics(day);
        setSubmissions(comics);
        setLastVoteUpdate(new Date());
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading tournament data:", err);
        setError("Failed to load tournament data. Please refresh the page.");
        setLoading(false);
      }
    };
    
    loadTournamentData();
  }, []);

  // Check profile ownership and load slot info when wallet connects
  useEffect(() => {
    const checkProfileAndSlots = async () => {
      if (!address || !signer) return;
      
      try {
        const profileService = new ProfileNFTService();
        await profileService.initialize();
        const hasProf = await profileService.hasProfile(address);
        setHasProfile(hasProf);
        
        // Initialize froth service with wallet
        await frothComicService.initialize(signer);
        
        // Load slot info
        const slots = await frothComicService.getComicSlotInfo(currentDay, address);
        setSlotInfo(slots);
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };
    
    checkProfileAndSlots();
  }, [address, signer, currentDay]);

  // Reload slot info after submission or entry
  const reloadSlotInfo = async () => {
    if (!address) return;
    try {
      const slots = await frothComicService.getComicSlotInfo(currentDay, address);
      setSlotInfo(slots);
    } catch (err) {
      console.error("Error reloading slot info:", err);
    }
  };

  // Update vote counts manually
  const handleUpdateVotes = async () => {
    setUpdatingVotes(true);
    try {
      const comics = await frothComicService.getDayComics(currentDay);
      setSubmissions(comics);
      setLastVoteUpdate(new Date());
    } catch (err) {
      console.error("Error updating votes:", err);
      setError("Failed to update vote counts");
    }
    setUpdatingVotes(false);
  };

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

  // Handle tournament entry
  const handleEnterTournament = async () => {
    if (!address || !signer) {
      setError("Please connect your wallet");
      return;
    }
    
    if (!hasProfile) {
      setError("You need an ImmutableType Profile to enter tournaments");
      return;
    }

    if (!slotInfo) {
      setError("Loading entry information...");
      return;
    }

    if (slotInfo.tournamentEntries >= 5) {
      setError("Maximum 5 tournament entries per day reached");
      return;
    }
    
    try {
      setEnteringTournament(true);
      setError("");
      
      await frothComicService.enterTournament(currentDay);
      
      // Reload slot info and day info
      await reloadSlotInfo();
      const info = await frothComicService.getDayInfo(currentDay);
      setDayInfo(info);
      
      setEnteringTournament(false);
    } catch (err: any) {
      console.error("Tournament entry error:", err);
      setError(err.message || "Failed to enter tournament. Please try again.");
      setEnteringTournament(false);
    }
  };

  // Handle comic submission
  const handleMintComic = async () => {
    if (!address || !signer) {
      setError("Please connect your wallet");
      return;
    }
    
    if (!hasProfile) {
      setError("You need an ImmutableType Profile to submit comics");
      return;
    }

    if (!slotInfo || slotInfo.comicsRemaining <= 0) {
      setError("No comic slots available. Enter the tournament first.");
      return;
    }
    
    if (!allPanelsHaveWords(panelWordIndices)) {
      setError("All 4 panels must have at least 1 word!");
      return;
    }
    
    if (!dayInfo?.submissionOpen) {
      setError("Submissions are closed for this day");
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");
      
      setSubmitMessage("Submitting your comic to the blockchain...");
      
      const tokenId = await frothComicService.mintComic(
        currentDay,
        selectedCharacters,
        selectedBackground,
        wordCloudId,
        panelWordIndices
      );
      
      setSubmitMessage("Success! Your comic has been minted 🎉");
      
      // Reset form
      setPanelWordIndices([[], [], [], []]);
      setUsedWordIndices(new Set());
      
      // Reload submissions and slot info
      const comics = await frothComicService.getDayComics(currentDay);
      setSubmissions(comics);
      await reloadSlotInfo();
      
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
    
    if (!dayInfo?.votingOpen) {
      setError("Voting is not open yet");
      return;
    }
    
    try {
      setVoting({ ...voting, [tokenId]: true });
      setError("");
      
      await frothComicService.vote(tokenId, amount.toString());
      
      // Reload submissions to show updated votes
      const comics = await frothComicService.getDayComics(currentDay);
      setSubmissions(comics);
      setLastVoteUpdate(new Date());
      
      setVoting({ ...voting, [tokenId]: false });
    } catch (err: any) {
      console.error("Voting error:", err);
      setError(err.message || "Failed to cast vote. Please try again.");
      setVoting({ ...voting, [tokenId]: false });
    }
  };

  // Check rewards
  const handleCheckRewards = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }
    
    try {
      // Check Day 363 (yesterday) for rewards
      const dayToCheck = 363;
      const creatorReward = await frothComicService.getCreatorReward(dayToCheck, address);
      const voterReward = await frothComicService.getVoterReward(dayToCheck, address);
      
      setClaimableRewards({
        creator: creatorReward,
        voter: voterReward,
        claimed: false
      });
      setShowRewardsModal(true);
    } catch (err) {
      console.error("Error checking rewards:", err);
      setError("Failed to check rewards");
    }
  };

  // Claim voter reward
  const handleClaimVoterReward = async () => {
    if (!address || !signer) return;
    
    try {
      await frothComicService.claimVoterReward(363);  // Match the day we're checking

      
      // Refresh rewards
      await handleCheckRewards();
    } catch (err: any) {
      console.error("Claim error:", err);
      setError(err.message || "Failed to claim rewards");
    }
  };

  // Claim creator reward
  const handleClaimCreatorReward = async () => {
    if (!address || !signer) return;
    
    try {
      await frothComicService.claimCreatorReward(363);
      
      // Refresh rewards
      await handleCheckRewards();
    } catch (err: any) {
      console.error("Claim error:", err);
      setError(err.message || "Failed to claim rewards");
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

  // Show error if day info failed to load
  if (!dayInfo) {
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

  const totalPrizePool = Number(dayInfo.creatorPool) + Number(dayInfo.voterPool);
  const canEnterAgain = slotInfo && slotInfo.comicsRemaining === 0 && slotInfo.tournamentEntries < 5;

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
              Time Remaining: <strong style={{ color: dayInfo.secondsUntilNextPhase <= 3600 ? '#ef4444' : '#666' }}>
                {formatTimeRemaining(dayInfo.secondsUntilNextPhase)}
              </strong>
            </div>
            <div style={{ fontSize: '14px', color: '#888', marginTop: '0.5rem' }}>
              {submissions.length} submissions so far
            </div>
          </div>

          {/* Buy BUFFAFLOW Button */}
          <a
            href="https://flowfun.xyz/collection/6893c3f9fc44a8bb9e159eb4/token"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '1rem'
            }}
          >
            🦬 Buy BUFFAFLOW to Vote
          </a>

          {/* Entry Status */}
          {address && slotInfo && (
            <div style={{ 
              background: '#f0f9ff', 
              border: '2px solid #3b82f6', 
              borderRadius: '8px', 
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e40af' }}>
                Entry Status
              </div>
              {slotInfo.tournamentEntries > 0 ? (
                <>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <strong>{slotInfo.comicsRemaining} of {slotInfo.maxAllowed} comics remaining</strong> ({slotInfo.tournamentEntries} tournament {slotInfo.tournamentEntries === 1 ? 'entry' : 'entries'})
                  </div>
                  {slotInfo.comicsRemaining === 0 && slotInfo.tournamentEntries < 5 && (
                    <div style={{ fontSize: '12px', color: '#10b981', marginTop: '0.5rem' }}>
                      ✓ All slots used - you can enter again!
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '14px', color: '#666' }}>
                  No entries yet - enter the tournament to start!
                </div>
              )}
            </div>
          )}

          {/* Entry Buttons */}
          {address && hasProfile && dayInfo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Enter Tournament Button */}
              {(!slotInfo || slotInfo.tournamentEntries === 0) && (
                <button
                  onClick={handleEnterTournament}
                  disabled={enteringTournament || !dayInfo.submissionOpen}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: (enteringTournament || !dayInfo.submissionOpen) ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (enteringTournament || !dayInfo.submissionOpen) ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {enteringTournament ? 'Entering...' : !dayInfo.submissionOpen ? 'Submissions Closed' : 'Enter Tournament (100 FROTH for 5 comics)'}
                </button>
              )}

              {/* Enter Again Button */}
              {slotInfo && slotInfo.tournamentEntries > 0 && (
                <button
                  onClick={handleEnterTournament}
                  disabled={!canEnterAgain || enteringTournament || !dayInfo.submissionOpen}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: (canEnterAgain && !enteringTournament && dayInfo.submissionOpen) ? '#10b981' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (canEnterAgain && !enteringTournament && dayInfo.submissionOpen) ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    position: 'relative'
                  }}
                  title={!canEnterAgain && slotInfo ? `Use all ${slotInfo.comicsRemaining} remaining comics before entering again` : ''}
                >
                  {enteringTournament ? 'Entering...' : 'Enter Again (100 FROTH for 5 more comics)'}
                </button>
              )}

              {/* Explanation when button is disabled */}
              {slotInfo && slotInfo.comicsRemaining > 0 && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  textAlign: 'center',
                  padding: '0.5rem',
                  background: '#fef3c7',
                  borderRadius: '6px',
                  border: '1px solid #f59e0b'
                }}>
                  💡 Submit your {slotInfo.comicsRemaining} remaining {slotInfo.comicsRemaining === 1 ? 'comic' : 'comics'} before buying more entries
                </div>
              )}
            </div>
          )}

          {/* Entry Cost Breakdown */}
          <div style={{ 
            background: '#f9fafb', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Entry Cost: 100 FROTH
            </div>
            <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '1.5rem', margin: 0 }}>
              <li>33 FROTH → Treasury (converts to FVIX)</li>
              <li>34 FROTH → Creator Prize Pool</li>
              <li>33 FROTH → Voter Prize Pool</li>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              🏆 Today's Leaderboard
            </h2>
            
            {/* Update Vote Counts Button */}
            <button
              onClick={handleUpdateVotes}
              disabled={updatingVotes}
              style={{
                padding: '0.5rem 1rem',
                background: updatingVotes ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: updatingVotes ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🔄 {updatingVotes ? 'Updating...' : 'Update Votes'}
            </button>
          </div>

          {/* Last Updated Timestamp */}
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '1rem' }}>
            Last updated: {lastVoteUpdate.toLocaleTimeString()}
          </div>
          
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
          ℹ️ You need an ImmutableType Profile to participate. <a href="/profile/create" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Create one here</a>
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
      {!submitting && address && (
        <div style={{ 
          background: '#fff', 
          border: '2px solid #ddd', 
          borderRadius: '12px', 
          padding: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Create Your Entry
          </h2>

          {/* Character Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 'bold' }}>
              Choose Characters for Each Panel
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[0, 1, 2, 3].map(panelIdx => (
                <div key={panelIdx} style={{ 
                  border: '2px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  background: '#f9fafb'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>
                    Panel {panelIdx + 1}
                  </div>
                  <select
                    value={selectedCharacters[panelIdx]}
                    onChange={(e) => {
                      const newChars = [...selectedCharacters];
                      newChars[panelIdx] = Number(e.target.value);
                      setSelectedCharacters(newChars);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
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
              You have access to {DAILY_WORDS.length} official KittyPunch ecosystem terms: Punch, PunchSwap, FVIX, Trenches, Vaults, and more!
            </p>
            
            <div style={{ fontSize: '12px', color: '#888', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
              <strong>Additional packs coming soon:</strong> Degen Starter, Flow Culture, Market Master, Tournament Pro
            </div>
          </div>

          {/* Mint Section - WITH GATING */}
          <div style={{ 
            background: '#f9fafb', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            {!hasProfile ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '16px' }}>
                  You need an ImmutableType Profile to participate
                </p>
                <a 
                  href="/profile/create"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    background: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  Create Profile →
                </a>
              </div>
            ) : !slotInfo || slotInfo.comicsRemaining === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '16px' }}>
                  Enter the tournament to submit comics
                </p>
                <button
                  onClick={handleEnterTournament}
                  disabled={enteringTournament || !dayInfo || !dayInfo.submissionOpen}
                  style={{
                    padding: '1rem 2rem',
                    background: (enteringTournament || !dayInfo || !dayInfo.submissionOpen) ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (enteringTournament || !dayInfo || !dayInfo.submissionOpen) ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {enteringTournament ? 'Entering...' : !dayInfo || !dayInfo.submissionOpen ? 'Submissions Closed' : 'Enter Tournament (100 FROTH)'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleMintComic}
                disabled={!allPanelsHaveWords(panelWordIndices) || !dayInfo || !dayInfo.submissionOpen}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: (allPanelsHaveWords(panelWordIndices) && dayInfo && dayInfo.submissionOpen) ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: (allPanelsHaveWords(panelWordIndices) && dayInfo && dayInfo.submissionOpen) ? 'pointer' : 'not-allowed'
                }}
              >
                {!dayInfo || !dayInfo.submissionOpen
                  ? 'Submissions Closed'
                  : !allPanelsHaveWords(panelWordIndices)
                  ? 'Add words to all 4 panels'
                  : `Mint Your Comic (${slotInfo.comicsRemaining} ${slotInfo.comicsRemaining === 1 ? 'slot' : 'slots'} remaining)`}
              </button>
            )}
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
                    {address && dayInfo && dayInfo.votingOpen && (
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
                          {isVoting ? 'Voting...' : 'Vote +1 🦬'}
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
                          {isVoting ? 'Voting...' : 'Vote +5 🦬'}
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
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
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
            
            <h2 style={{ marginBottom: '2rem' }}>Your Rewards - Day 363</h2>

<div style={{ marginBottom: '1.5rem' }}>
  <div style={{ fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>
    Creator Reward:
  </div>
  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
    {parseFloat(claimableRewards.creator).toFixed(2)} FROTH
  </div>
  
    <button
    onClick={handleClaimCreatorReward}
    disabled={parseFloat(claimableRewards.creator) === 0}
    style={{
      marginTop: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: parseFloat(claimableRewards.creator) === 0 ? '#9ca3af' : '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: parseFloat(claimableRewards.creator) === 0 ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    }}
  >
    Claim Creator Reward ({parseFloat(claimableRewards.creator).toFixed(2)} FROTH)
  </button>
</div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '0.5rem' }}>
                Voter Reward:
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {parseFloat(claimableRewards.voter).toFixed(2)} FROTH
              </div>
                <button
                onClick={handleClaimVoterReward}
                disabled={parseFloat(claimableRewards.voter) === 0 || claimableRewards.claimed}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: (parseFloat(claimableRewards.voter) === 0 || claimableRewards.claimed) ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (parseFloat(claimableRewards.voter) === 0 || claimableRewards.claimed) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Claim Voter Reward ({parseFloat(claimableRewards.voter).toFixed(2)} FROTH)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}