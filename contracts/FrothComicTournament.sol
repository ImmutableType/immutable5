// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IComicNFT.sol";
import "./interfaces/IProfileNFT.sol";

/**
 * @title FrothComicTournament
 * @dev Daily comic tournament with FROTH entry and BUFFAFLOW voting
 */
contract FrothComicTournament is Ownable {
    IERC20 public immutable frothToken;
    IERC20 public immutable buffaflowToken;
    IProfileNFT public immutable profileNFT;
    address public immutable treasury;
    address public comicNFT;
    
    uint256 public constant ENTRY_FEE = 100 ether;
    uint256 public constant MAX_ENTRIES_PER_DAY = 5;
    uint256 public constant MAX_VOTE_PER_COMIC = 100 ether;
    
    uint256 public immutable TOURNAMENT_EPOCH;
    uint256 public constant DAY_DURATION = 24 hours + 5 minutes;
    uint256 public constant SUBMISSION_DURATION = 24 hours;
    
    struct Winner {
        address creator;
        uint256 tokenId;
        uint256 reward;
        uint256 rank;
    }
    
    struct DayData {
        uint256 creatorPool;
        uint256 voterPool;
        uint256 totalVotes;
        bool finalized;
        uint256 finalizedAt;
        mapping(address => uint256) entryCount;
        mapping(address => uint256) votingPower;
        mapping(address => bool) voterClaimed;
    }
    
    mapping(uint256 => DayData) private dayData;
    mapping(uint256 => uint256) public comicVotes;
    mapping(uint256 => mapping(address => uint256)) public userVotesPerComic;
    mapping(uint256 => Winner[]) private dayWinners;
    
    event TournamentEntered(address indexed user, uint256 indexed dayId, uint256 entryNumber);
    event Voted(address indexed voter, uint256 indexed tokenId, uint256 amount, uint256 totalVotesOnComic);
    event DayFinalized(uint256 indexed dayId, uint256 creatorPool, uint256 voterPool);
    event CreatorRewardDistributed(address indexed creator, uint256 indexed dayId, uint256 tokenId, uint256 amount, uint256 rank);
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
        uint256 endTime = getDayEndTime(dayId);
        uint256 finalizationTime = getDayFinalizationTime(dayId);
        return block.timestamp >= endTime && block.timestamp < finalizationTime;
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
            buffaflowToken.transferFrom(msg.sender, address(this), buffaflowAmount),
            "BUFFAFLOW transfer failed"
        );
        
        userVotesPerComic[comicTokenId][msg.sender] += buffaflowAmount;
        comicVotes[comicTokenId] += buffaflowAmount;
        dayData[dayId].votingPower[msg.sender] += buffaflowAmount;
        dayData[dayId].totalVotes += buffaflowAmount;
        
        emit Voted(msg.sender, comicTokenId, buffaflowAmount, comicVotes[comicTokenId]);
    }
    
    function getUserVotesOnComic(uint256 comicTokenId, address user) external view returns (uint256) {
        return userVotesPerComic[comicTokenId][user];
    }
    
    function finalizeDayAndDistribute(
        uint256 dayId,
        uint256[] calldata winningTokenIds,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(canFinalize(dayId), "Not ready for finalization");
        require(winningTokenIds.length == amounts.length, "Array mismatch");
        require(winningTokenIds.length > 0, "Must have at least one winner");
        
        DayData storage day = dayData[dayId];
        
        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Invalid amount");
            totalDistributed += amounts[i];
        }
        
        require(totalDistributed <= day.creatorPool, "Exceeds creator pool");
        
        for (uint256 i = 0; i < winningTokenIds.length; i++) {
            address creator = IERC721(comicNFT).ownerOf(winningTokenIds[i]);
            
            dayWinners[dayId].push(Winner({
                creator: creator,
                tokenId: winningTokenIds[i],
                reward: amounts[i],
                rank: i + 1
            }));
            
            require(
                frothToken.transfer(creator, amounts[i]),
                "Creator reward transfer failed"
            );
            
            emit CreatorRewardDistributed(creator, dayId, winningTokenIds[i], amounts[i], i + 1);
        }
        
        day.finalized = true;
        day.finalizedAt = block.timestamp;
        
        emit DayFinalized(dayId, day.creatorPool, day.voterPool);
    }
    
    function getDayWinners(uint256 dayId) external view returns (Winner[] memory) {
        return dayWinners[dayId];
    }
    
    function claimVoterReward(uint256 dayId) external {
        DayData storage day = dayData[dayId];
        
        require(day.finalized, "Day not finalized");
        require(!day.voterClaimed[msg.sender], "Already claimed");
        require(day.votingPower[msg.sender] > 0, "No voting power");
        require(day.totalVotes > 0, "No votes cast");
        
        uint256 voterShare = (day.voterPool * day.votingPower[msg.sender]) / day.totalVotes;
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
    
    function getVoterReward(uint256 dayId, address user) external view returns (uint256) {
        DayData storage day = dayData[dayId];
        
        if (!day.finalized || day.voterClaimed[user] || day.votingPower[user] == 0 || day.totalVotes == 0) {
            return 0;
        }
        
        return (day.voterPool * day.votingPower[user]) / day.totalVotes;
    }
    
    function emergencyWithdrawBuffaflow() external onlyOwner {
        uint256 balance = buffaflowToken.balanceOf(address(this));
        require(balance > 0, "No BUFFAFLOW");
        require(buffaflowToken.transfer(owner(), balance), "Withdraw failed");
    }
}