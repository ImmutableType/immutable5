// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IComicNFT.sol";
import "./interfaces/IProfileNFT.sol";

/**
 * @title FrothComicTournamentV2
 * @dev Daily comic tournament with continuous voting and automatic finalization
 * @notice Voting opens immediately at tournament start (8:00 PM Miami) and closes at 8:05 PM next day
 */
contract FrothComicTournamentV2 is Ownable {
    IERC20 public immutable frothToken;
    IERC20 public immutable buffaflowToken;
    IProfileNFT public immutable profileNFT;
    address public immutable treasury;
    address public comicNFT;
    
    uint256 public constant ENTRY_FEE = 100 ether;
    uint256 public constant MAX_ENTRIES_PER_DAY = 5;
    uint256 public constant MAX_VOTE_PER_COMIC = 100 ether;
    
    uint256 public immutable TOURNAMENT_EPOCH; // 8:00 PM Miami time
    uint256 public constant DAY_DURATION = 24 hours + 5 minutes;
    uint256 public constant SUBMISSION_DURATION = 24 hours;
    
    struct VoteData {
        uint256 totalVotes;
        uint256 lastVoteTimestamp;
    }
    
    struct Winner {
        address creator;
        uint256 tokenId;
        uint256 creatorReward;
        uint256 totalVoterPool;
    }
    
    struct DayData {
        uint256 creatorPool;
        uint256 voterPool;
        uint256 totalVotes;
        bool finalized;
        uint256 finalizedAt;
        uint256 winningTokenId;
        mapping(address => uint256) entryCount;
        mapping(address => uint256) votingPowerOnWinner; // Only tracks votes on winning comic
        mapping(address => bool) creatorClaimed;
        mapping(address => bool) voterClaimed;
    }
    
    mapping(uint256 => DayData) private dayData;
    mapping(uint256 => VoteData) public comicVotes;
    mapping(uint256 => mapping(address => uint256)) public userVotesPerComic;
    
    event TournamentEntered(address indexed user, uint256 indexed dayId, uint256 entryNumber);
    event Voted(address indexed voter, uint256 indexed tokenId, uint256 amount, uint256 totalVotesOnComic);
    event DayFinalized(uint256 indexed dayId, uint256 winningTokenId, address indexed winner, uint256 creatorReward, uint256 voterPool);
    event CreatorRewardClaimed(address indexed creator, uint256 indexed dayId, uint256 amount);
    event VoterRewardClaimed(address indexed voter, uint256 indexed dayId, uint256 amount);
    
    constructor(
        address _frothToken,
        address _buffaflowToken,
        address _profileNFT,
        address _treasury,
        uint256 _tournamentEpoch
    ) Ownable(msg.sender) {
        frothToken = IERC20(_frothToken);
        buffaflowToken = IERC20(_buffaflowToken);
        profileNFT = IProfileNFT(_profileNFT);
        treasury = _treasury;
        TOURNAMENT_EPOCH = _tournamentEpoch;
    }
    
    function setComicNFT(address _comicNFT) external onlyOwner {
        require(comicNFT == address(0), "Already set");
        comicNFT = _comicNFT;
    }
    
    function getCurrentDay() public view returns (uint256) {
        if (block.timestamp < TOURNAMENT_EPOCH) return 0;
        return (block.timestamp - TOURNAMENT_EPOCH) / DAY_DURATION;
    }
    
    function getDayStartTime(uint256 dayId) public view returns (uint256) {
        return TOURNAMENT_EPOCH + (dayId * DAY_DURATION);
    }
    
    function getDayEndTime(uint256 dayId) public view returns (uint256) {
        return getDayStartTime(dayId) + SUBMISSION_DURATION;
    }
    
    function getDayFinalizationTime(uint256 dayId) public view returns (uint256) {
        return getDayStartTime(dayId) + DAY_DURATION;
    }
    
    function isSubmissionOpen(uint256 dayId) public view returns (bool) {
        uint256 startTime = getDayStartTime(dayId);
        uint256 endTime = getDayEndTime(dayId);
        return block.timestamp >= startTime && block.timestamp < endTime;
    }
    
    function isVotingOpen(uint256 dayId) public view returns (bool) {
        uint256 startTime = getDayStartTime(dayId);
        uint256 finalizationTime = getDayFinalizationTime(dayId);
        return block.timestamp >= startTime && block.timestamp < finalizationTime;
    }
    
    function canFinalize(uint256 dayId) public view returns (bool) {
        return block.timestamp >= getDayFinalizationTime(dayId) && !dayData[dayId].finalized;
    }
    
    function enterTournament(uint256 dayId) external {
        require(dayId == getCurrentDay(), "Can only enter current day");
        require(isSubmissionOpen(dayId), "Submissions not open");
        require(profileNFT.hasProfile(msg.sender), "Must have ImmutableType Profile");
        
        DayData storage day = dayData[dayId];
        require(day.entryCount[msg.sender] < MAX_ENTRIES_PER_DAY, "Max 5 entries per day");
        
        require(
            frothToken.transferFrom(msg.sender, treasury, 33 ether),
            "Treasury transfer failed"
        );
        require(
            frothToken.transferFrom(msg.sender, address(this), 67 ether),
            "Prize pool transfer failed"
        );
        
        day.creatorPool += 34 ether;
        day.voterPool += 33 ether;
        day.entryCount[msg.sender]++;
        
        emit TournamentEntered(msg.sender, dayId, day.entryCount[msg.sender]);
    }
    
    function getEntryCount(uint256 dayId, address user) external view returns (uint256) {
        return dayData[dayId].entryCount[user];
    }
    
    function hasEntered(uint256 dayId, address user) external view returns (bool) {
        return dayData[dayId].entryCount[user] > 0;
    }
    
    function vote(uint256 comicTokenId, uint256 buffaflowAmount) external {
        require(comicNFT != address(0), "ComicNFT not set");
        require(buffaflowAmount > 0, "Must vote with BUFFAFLOW");
        
        uint256 dayId = IComicNFT(comicNFT).getComicDay(comicTokenId);
        require(isVotingOpen(dayId), "Voting not open");
        
        uint256 currentVotes = userVotesPerComic[comicTokenId][msg.sender];
        require(
            currentVotes + buffaflowAmount <= MAX_VOTE_PER_COMIC,
            "Max 100 BUFFAFLOW per comic"
        );
        
        require(
            buffaflowToken.transferFrom(msg.sender, treasury, buffaflowAmount),
            "BUFFAFLOW transfer failed"
        );
        
        userVotesPerComic[comicTokenId][msg.sender] += buffaflowAmount;
        
        VoteData storage voteData = comicVotes[comicTokenId];
        voteData.totalVotes += buffaflowAmount;
        voteData.lastVoteTimestamp = block.timestamp;
        
        dayData[dayId].totalVotes += buffaflowAmount;
        
        emit Voted(msg.sender, comicTokenId, buffaflowAmount, voteData.totalVotes);
    }
    
    function getUserVotesOnComic(uint256 comicTokenId, address user) external view returns (uint256) {
        return userVotesPerComic[comicTokenId][user];
    }
    
    function finalizeDay(uint256 dayId) external {
        require(canFinalize(dayId), "Not ready for finalization");
        
        DayData storage day = dayData[dayId];
        require(!day.finalized, "Already finalized");
        
        // Get all comics for this day
        uint256[] memory tokenIds = IComicNFT(comicNFT).getDayComics(dayId);
        require(tokenIds.length > 0, "No submissions");
        
        // Determine winner using tie-breaking logic
        uint256 winningTokenId = determineWinner(tokenIds);
        
        // Store winner
        day.winningTokenId = winningTokenId;
        day.finalized = true;
        day.finalizedAt = block.timestamp;
        
        // Calculate voter shares for winning comic only
        uint256 winningComicVotes = comicVotes[winningTokenId].totalVotes;
        
        // Store voting power only for voters who voted on winning comic
        if (winningComicVotes > 0) {
            // Note: Individual voting power is calculated in getVoterReward()
            // We don't store per-user data here to save gas
        }
        
        address winner = IERC721(comicNFT).ownerOf(winningTokenId);
        
        emit DayFinalized(dayId, winningTokenId, winner, day.creatorPool, day.voterPool);
    }
    
    function determineWinner(uint256[] memory tokenIds) internal view returns (uint256) {
        require(tokenIds.length > 0, "No tokens");
        
        uint256 winner = tokenIds[0];
        VoteData memory winnerData = comicVotes[winner];
        
        for (uint256 i = 1; i < tokenIds.length; i++) {
            uint256 challenger = tokenIds[i];
            VoteData memory challengerData = comicVotes[challenger];
            
            // 1. Most votes wins
            if (challengerData.totalVotes > winnerData.totalVotes) {
                winner = challenger;
                winnerData = challengerData;
            } 
            // 2. If tied on votes, last vote timestamp wins
            else if (challengerData.totalVotes == winnerData.totalVotes) {
                if (challengerData.lastVoteTimestamp > winnerData.lastVoteTimestamp) {
                    winner = challenger;
                    winnerData = challengerData;
                }
                // 3. If same timestamp (same block), lowest tokenId wins (first minted)
                else if (challengerData.lastVoteTimestamp == winnerData.lastVoteTimestamp) {
                    if (challenger < winner) {
                        winner = challenger;
                        winnerData = challengerData;
                    }
                }
            }
        }
        
        return winner;
    }
    
    function claimCreatorReward(uint256 dayId) external {
        DayData storage day = dayData[dayId];
        
        require(day.finalized, "Day not finalized");
        require(!day.creatorClaimed[msg.sender], "Already claimed");
        
        address winner = IERC721(comicNFT).ownerOf(day.winningTokenId);
        require(msg.sender == winner, "Not the winner");
        
        day.creatorClaimed[msg.sender] = true;
        
        require(frothToken.transfer(msg.sender, day.creatorPool), "Transfer failed");
        emit CreatorRewardClaimed(msg.sender, dayId, day.creatorPool);
    }
    
    function claimVoterReward(uint256 dayId) external {
        DayData storage day = dayData[dayId];
        
        require(day.finalized, "Day not finalized");
        require(!day.voterClaimed[msg.sender], "Already claimed");
        
        uint256 userVotesOnWinner = userVotesPerComic[day.winningTokenId][msg.sender];
        require(userVotesOnWinner > 0, "Did not vote for winner");
        
        uint256 totalWinningVotes = comicVotes[day.winningTokenId].totalVotes;
        require(totalWinningVotes > 0, "No votes on winner");
        
        uint256 voterShare = (day.voterPool * userVotesOnWinner) / totalWinningVotes;
        day.voterClaimed[msg.sender] = true;
        
        require(frothToken.transfer(msg.sender, voterShare), "Transfer failed");
        emit VoterRewardClaimed(msg.sender, dayId, voterShare);
    }
    
    function getDayInfo(uint256 dayId) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 finalizationTime,
        uint256 creatorPool,
        uint256 voterPool,
        uint256 totalVotes,
        bool submissionOpen,
        bool votingOpen,
        bool finalized,
        uint256 secondsUntilNextPhase
    ) {
        DayData storage day = dayData[dayId];
        
        startTime = getDayStartTime(dayId);
        endTime = getDayEndTime(dayId);
        finalizationTime = getDayFinalizationTime(dayId);
        creatorPool = day.creatorPool;
        voterPool = day.voterPool;
        totalVotes = day.totalVotes;
        submissionOpen = isSubmissionOpen(dayId);
        votingOpen = isVotingOpen(dayId);
        finalized = day.finalized;
        
        if (block.timestamp < startTime) {
            secondsUntilNextPhase = startTime - block.timestamp;
        } else if (block.timestamp < endTime) {
            secondsUntilNextPhase = endTime - block.timestamp;
        } else if (block.timestamp < finalizationTime) {
            secondsUntilNextPhase = finalizationTime - block.timestamp;
        } else {
            secondsUntilNextPhase = 0;
        }
    }
    
    function getWinningTokenId(uint256 dayId) external view returns (uint256) {
        require(dayData[dayId].finalized, "Day not finalized");
        return dayData[dayId].winningTokenId;
    }
    
    function getCreatorReward(uint256 dayId, address creator) external view returns (uint256) {
        DayData storage day = dayData[dayId];
        
        if (!day.finalized || day.creatorClaimed[creator]) {
            return 0;
        }
        
        address winner = IERC721(comicNFT).ownerOf(day.winningTokenId);
        if (creator != winner) {
            return 0;
        }
        
        return day.creatorPool;
    }
    
    function getVoterReward(uint256 dayId, address user) external view returns (uint256) {
        DayData storage day = dayData[dayId];
        
        if (!day.finalized || day.voterClaimed[user]) {
            return 0;
        }
        
        uint256 userVotesOnWinner = userVotesPerComic[day.winningTokenId][user];
        if (userVotesOnWinner == 0) {
            return 0;
        }
        
        uint256 totalWinningVotes = comicVotes[day.winningTokenId].totalVotes;
        if (totalWinningVotes == 0) {
            return 0;
        }
        
        return (day.voterPool * userVotesOnWinner) / totalWinningVotes;
    }
    
    function emergencyWithdrawBuffaflow() external onlyOwner {
        uint256 balance = buffaflowToken.balanceOf(address(this));
        require(balance > 0, "No BUFFAFLOW");
        require(buffaflowToken.transfer(owner(), balance), "Withdraw failed");
    }
}