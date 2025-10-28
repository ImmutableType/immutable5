// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// ============================================
// INTERFACES
// ============================================

interface IProfileNFT {
    function hasProfile(address user) external view returns (bool);
}

/**
 * @title FrothComicDaily
 * @notice Daily comic tournament with FROTH entry fees and BUFFAFLOW voting
 * @dev Upgradeable ERC721 with treasury-seeded prize pools
 */
contract FrothComicDaily is 
    ERC721Upgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable 
{
    using Strings for uint256;

    // ============================================
    // CONSTANTS
    // ============================================

    uint256 public constant TOURNAMENT_DURATION = 20 hours + 5 minutes;
    uint256 public constant OVERLAP_BUFFER = 5 minutes;
    
    // Fee split percentages (must sum to 100)
    uint256 public constant TREASURY_PCT = 33;
    uint256 public constant CREATOR_POOL_PCT = 34;
    uint256 public constant VOTER_POOL_PCT = 33;

    // ============================================
    // STATE VARIABLES
    // ============================================

    // Token contracts
    IERC20 public frothToken;
    IERC20 public buffaflowToken;
    address public treasuryWallet;
    IProfileNFT public profileNFTContract;

    // Economic parameters
    uint256 public entryFee;
    uint256 public voteCost;
    uint256 public maxVotesPerWallet;
    uint256 public dailySeedAmount;

    // Tournament tracking
    uint256 public genesisTimestamp;
    uint256 private _tokenIdCounter;

    // ============================================
    // STRUCTS
    // ============================================

    struct DailyTemplate {
        uint256 dayId;
        uint8[4] characterIds;
        uint8 backgroundId;
        uint256 opensAt;           // ✅ RENAMED from openTime
        uint256 closesAt;          // ✅ RENAMED from closeTime
        uint256 totalEntries;
        uint256 creatorPool;
        uint256 voterPool;
        uint256 treasuryCollected;
        address[] winners;
        uint256[] winningTokenIds;
        bool finalized;
    }

    struct Submission {
        uint256 tokenId;
        address creator;
        uint256 dayId;
        uint8[4] characterIds;
        uint8 backgroundId;
        uint256[][] wordIndices;   // ✅ CHANGED: Variable-length arrays (1-10 words per panel)
        uint256 votes;
        uint256 timestamp;
        bool exists;
    }

    struct VoterContribution {
        uint256 totalVotes;
        bool claimed;
    }

    // ============================================
    // MAPPINGS
    // ============================================

    mapping(uint256 => DailyTemplate) public dailyTemplates;
    mapping(uint256 => Submission) public submissions;
    mapping(uint256 => uint256[]) public daySubmissionIds;
    mapping(uint256 => mapping(uint256 => uint256)) public userVotesOnSubmission;
    mapping(uint256 => mapping(address => VoterContribution)) public voterContributions;
    mapping(uint256 => mapping(address => uint256)) public creatorRewards;

    // ============================================
    // EVENTS
    // ============================================

    event DailyTemplateGenerated(uint256 indexed dayId, uint8[4] characters, uint8 background);
    event DailyTemplateSeeded(uint256 indexed dayId, uint256 seedAmount);
    event EntrySubmitted(uint256 indexed tokenId, address indexed creator, uint256 indexed dayId);
    event VoteCast(uint256 indexed tokenId, address indexed voter, uint256 amount, uint256 totalVotes);
    event DayFinalized(uint256 indexed dayId, address[] winners, uint256[] tokenIds, uint256 rewardPerWinner);
    event CreatorRewardClaimed(uint256 indexed dayId, address indexed creator, uint256 amount);
    event VoterRewardClaimed(uint256 indexed dayId, address indexed voter, uint256 amount);
    event SeedAmountUpdated(uint256 newAmount);
    event EntryFeeUpdated(uint256 newFee);

    // ============================================
    // INITIALIZATION
    // ============================================

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _frothToken,
        address _buffaflowToken,
        address _treasuryWallet,
        address _profileNFTContract
    ) public initializer {
        __ERC721_init("FROTH Daily Comic", "FROTHCOMIC");
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        require(_frothToken != address(0), "Invalid FROTH address");
        require(_buffaflowToken != address(0), "Invalid BUFFAFLOW address");
        require(_treasuryWallet != address(0), "Invalid treasury address");
        require(_profileNFTContract != address(0), "Invalid ProfileNFT address");

        frothToken = IERC20(_frothToken);
        buffaflowToken = IERC20(_buffaflowToken);
        treasuryWallet = _treasuryWallet;
        profileNFTContract = IProfileNFT(_profileNFTContract);

        // Default economic parameters
        entryFee = 100 * 10**18;
        voteCost = 1 * 10**18;
        maxVotesPerWallet = 100;
        dailySeedAmount = 1000 * 10**18;

        genesisTimestamp = block.timestamp;
        _tokenIdCounter = 1;

        _generateDailyTemplateNoSeed(0);
    }

    function setGenesisTimestamp(uint256 timestamp) external onlyOwner {
        genesisTimestamp = timestamp;
        _generateDailyTemplateNoSeed(0);
    }

    // ============================================
    // TOURNAMENT MANAGEMENT
    // ============================================

    function getCurrentDay() public view returns (uint256) {
        if (block.timestamp < genesisTimestamp) return 0;
        return (block.timestamp - genesisTimestamp) / TOURNAMENT_DURATION;
    }

    function canSubmitToDay(uint256 dayId) public view returns (bool) {
        DailyTemplate storage template = dailyTemplates[dayId];
        return block.timestamp >= template.opensAt && 
               block.timestamp < template.closesAt &&
               !template.finalized;
    }

    function canFinalizeDay(uint256 dayId) public view returns (bool) {
        DailyTemplate storage template = dailyTemplates[dayId];
        return block.timestamp >= template.closesAt && !template.finalized;
    }

    function _generateDailyTemplateNoSeed(uint256 dayId) internal {
        DailyTemplate storage template = dailyTemplates[dayId];
        
        if (template.dayId != 0 || (dayId == 0 && template.backgroundId != 0)) {
            return;
        }

        template.dayId = dayId;
        template.backgroundId = uint8(dayId % 5);
        template.characterIds = _selectRandomCharacters(dayId);
        
        uint256 dayStart = genesisTimestamp + (dayId * TOURNAMENT_DURATION);
        template.opensAt = dayStart - OVERLAP_BUFFER;
        template.closesAt = dayStart + TOURNAMENT_DURATION - OVERLAP_BUFFER;
        
        emit DailyTemplateGenerated(dayId, template.characterIds, template.backgroundId);
    }

    function _generateDailyTemplate(uint256 dayId) internal {
        DailyTemplate storage template = dailyTemplates[dayId];
        
        if (template.dayId != 0 || (dayId == 0 && template.backgroundId != 0)) {
            return;
        }

        template.dayId = dayId;
        template.backgroundId = uint8(dayId % 5);
        template.characterIds = _selectRandomCharacters(dayId);
        
        uint256 dayStart = genesisTimestamp + (dayId * TOURNAMENT_DURATION);
        template.opensAt = dayStart - OVERLAP_BUFFER;
        template.closesAt = dayStart + TOURNAMENT_DURATION - OVERLAP_BUFFER;
        
        if (dailySeedAmount > 0) {
            bool success = frothToken.transferFrom(treasuryWallet, address(this), dailySeedAmount);
            if (success) {
                template.creatorPool = (dailySeedAmount * CREATOR_POOL_PCT) / 100;
                template.voterPool = (dailySeedAmount * VOTER_POOL_PCT) / 100;
                template.treasuryCollected = dailySeedAmount - template.creatorPool - template.voterPool;
                emit DailyTemplateSeeded(dayId, dailySeedAmount);
            }
        }
        
        emit DailyTemplateGenerated(dayId, template.characterIds, template.backgroundId);
    }

    function _selectRandomCharacters(uint256 dayId) internal view returns (uint8[4] memory) {
        bytes32 randomHash = keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            dayId,
            block.timestamp,
            block.prevrandao
        ));
        
        uint8[4] memory selected;
        bool[13] memory used;
        
        for (uint256 i = 0; i < 4; i++) {
            uint8 charId;
            uint256 attempts = 0;
            
            do {
                charId = uint8(uint256(keccak256(abi.encodePacked(randomHash, i, attempts))) % 13);
                attempts++;
            } while (used[charId] && attempts < 50);
            
            selected[i] = charId;
            used[charId] = true;
        }
        
        return selected;
    }

    function _ensureDayInitialized(uint256 dayId) internal {
        DailyTemplate storage template = dailyTemplates[dayId];
        if (template.dayId == 0 && dayId > 0) {
            _generateDailyTemplate(dayId);
        }
    }

    // ============================================
    // ENTRY SUBMISSION - ✅ FIXED FOR VARIABLE-LENGTH ARRAYS
    // ============================================

    function submitEntry(
    uint256[][] calldata wordIndices
) external nonReentrant whenNotPaused returns (uint256) {
    require(profileNFTContract.hasProfile(msg.sender), "Must have ProfileNFT");
    
    // ✅ NEW: Validate word indices structure
    require(wordIndices.length == 4, "Must have exactly 4 panels");
    for (uint256 i = 0; i < 4; i++) {
        require(wordIndices[i].length > 0, "Each panel must have at least 1 word");
        require(wordIndices[i].length <= 10, "Each panel must have at most 10 words");
        
        for (uint256 j = 0; j < wordIndices[i].length; j++) {
            require(wordIndices[i][j] <= 161, "Word index out of bounds");
        }
    }
    
    uint256 dayId = getCurrentDay();
    _ensureDayInitialized(dayId);
    DailyTemplate storage template = dailyTemplates[dayId];
    
    require(canSubmitToDay(dayId), "Submissions not open");
    
    // Calculate fee splits
    uint256 treasuryAmount = (entryFee * TREASURY_PCT) / 100;
    uint256 creatorAmount = (entryFee * CREATOR_POOL_PCT) / 100;
    uint256 voterAmount = entryFee - treasuryAmount - creatorAmount;
    
    // ✅ FIXED: Direct transfers from user to avoid intermediate balance issues
    // Send treasury portion directly from user to treasury
    require(
        frothToken.transferFrom(msg.sender, treasuryWallet, treasuryAmount),
        "Treasury transfer failed"
    );
    
    // Send prize pool portions from user to contract
    require(
        frothToken.transferFrom(msg.sender, address(this), creatorAmount + voterAmount),
        "Prize pool transfer failed"
    );
    
    template.creatorPool += creatorAmount;
    template.voterPool += voterAmount;
    template.treasuryCollected += treasuryAmount;
    
    uint256 tokenId = _tokenIdCounter++;
    _safeMint(msg.sender, tokenId);
    
    submissions[tokenId] = Submission({
        tokenId: tokenId,
        creator: msg.sender,
        dayId: dayId,
        characterIds: template.characterIds,
        backgroundId: template.backgroundId,
        wordIndices: wordIndices,
        votes: 0,
        timestamp: block.timestamp,
        exists: true
    });
    
    daySubmissionIds[dayId].push(tokenId);
    template.totalEntries++;
    
    emit EntrySubmitted(tokenId, msg.sender, dayId);
    
    return tokenId;
}

    // ============================================
    // VOTING
    // ============================================

    function vote(
        uint256 tokenId,
        uint256 voteAmount
    ) external nonReentrant whenNotPaused {
        Submission storage submission = submissions[tokenId];
        require(submission.exists, "Submission does not exist");
        
        uint256 dayId = submission.dayId;
        DailyTemplate storage template = dailyTemplates[dayId];
        
        require(block.timestamp >= template.closesAt, "Voting not started");
        require(!template.finalized, "Day already finalized");
        require(voteAmount > 0, "Must vote at least 1");
        
        uint256 currentVotes = userVotesOnSubmission[dayId][tokenId];
        require(
            currentVotes + voteAmount <= maxVotesPerWallet,
            "Exceeds vote limit per submission"
        );
        
        uint256 buffaflowAmount = voteAmount * voteCost;
        require(
            buffaflowToken.transferFrom(msg.sender, treasuryWallet, buffaflowAmount),
            "BUFFAFLOW transfer failed"
        );
        
        submission.votes += voteAmount;
        userVotesOnSubmission[dayId][tokenId] += voteAmount;
        voterContributions[dayId][msg.sender].totalVotes += voteAmount;
        
        emit VoteCast(tokenId, msg.sender, voteAmount, submission.votes);
    }

    // ============================================
    // FINALIZATION
    // ============================================

    function finalizeDay(uint256 dayId) external onlyOwner nonReentrant {
        DailyTemplate storage template = dailyTemplates[dayId];
        
        require(canFinalizeDay(dayId), "Cannot finalize yet");
        require(template.totalEntries > 0, "No submissions to finalize");
        
        (address[] memory winners, uint256[] memory winningTokenIds) = _determineWinners(dayId);
        
        template.winners = winners;
        template.winningTokenIds = winningTokenIds;
        template.finalized = true;
        
        uint256 rewardPerWinner = template.creatorPool / winners.length;
        for (uint256 i = 0; i < winners.length; i++) {
            creatorRewards[dayId][winners[i]] += rewardPerWinner;
        }
        
        emit DayFinalized(dayId, winners, winningTokenIds, rewardPerWinner);
    }

    function _determineWinners(uint256 dayId) internal view returns (
        address[] memory winners,
        uint256[] memory winningTokenIds
    ) {
        uint256[] storage submissionIds = daySubmissionIds[dayId];
        require(submissionIds.length > 0, "No submissions");
        
        uint256 highestVotes = 0;
        uint256 winnerCount = 0;
        
        for (uint256 i = 0; i < submissionIds.length; i++) {
            uint256 votes = submissions[submissionIds[i]].votes;
            if (votes > highestVotes) {
                highestVotes = votes;
                winnerCount = 1;
            } else if (votes == highestVotes) {
                winnerCount++;
            }
        }
        
        if (highestVotes == 0) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                dayId
            ))) % submissionIds.length;
            
            winners = new address[](1);
            winningTokenIds = new uint256[](1);
            winners[0] = submissions[submissionIds[randomIndex]].creator;
            winningTokenIds[0] = submissionIds[randomIndex];
            return (winners, winningTokenIds);
        }
        
        winners = new address[](winnerCount);
        winningTokenIds = new uint256[](winnerCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < submissionIds.length; i++) {
            uint256 tokenId = submissionIds[i];
            if (submissions[tokenId].votes == highestVotes) {
                winners[index] = submissions[tokenId].creator;
                winningTokenIds[index] = tokenId;
                index++;
            }
        }
        
        return (winners, winningTokenIds);
    }

    function handleZeroSubmissions(uint256 dayId) external onlyOwner {
        DailyTemplate storage template = dailyTemplates[dayId];
        require(template.totalEntries == 0, "Day has submissions");
        require(canFinalizeDay(dayId), "Cannot finalize yet");
        
        _ensureDayInitialized(dayId + 1);
        dailyTemplates[dayId + 1].creatorPool += template.creatorPool;
        dailyTemplates[dayId + 1].voterPool += template.voterPool;
        
        template.finalized = true;
    }

    // ============================================
    // REWARD CLAIMS
    // ============================================

    function claimCreatorReward(uint256 dayId) external nonReentrant {
        require(dailyTemplates[dayId].finalized, "Day not finalized");
        
        uint256 reward = creatorRewards[dayId][msg.sender];
        require(reward > 0, "No reward to claim");
        
        creatorRewards[dayId][msg.sender] = 0;
        
        require(frothToken.transfer(msg.sender, reward), "Transfer failed");
        
        emit CreatorRewardClaimed(dayId, msg.sender, reward);
    }

    function claimVoterReward(uint256 dayId) external nonReentrant {
        DailyTemplate storage template = dailyTemplates[dayId];
        require(template.finalized, "Day not finalized");
        
        VoterContribution storage contribution = voterContributions[dayId][msg.sender];
        require(contribution.totalVotes > 0, "No votes cast");
        require(!contribution.claimed, "Already claimed");
        
        uint256 totalDayVotes = _getTotalDayVotes(dayId);
        require(totalDayVotes > 0, "No votes on this day");
        
        uint256 voterReward = (template.voterPool * contribution.totalVotes) / totalDayVotes;
        
        contribution.claimed = true;
        
        require(frothToken.transfer(msg.sender, voterReward), "Transfer failed");
        
        emit VoterRewardClaimed(dayId, msg.sender, voterReward);
    }

    function claimMultipleDays(uint256[] calldata dayIds) external nonReentrant {
        for (uint256 i = 0; i < dayIds.length; i++) {
            uint256 dayId = dayIds[i];
            
            if (creatorRewards[dayId][msg.sender] > 0) {
                uint256 reward = creatorRewards[dayId][msg.sender];
                creatorRewards[dayId][msg.sender] = 0;
                require(frothToken.transfer(msg.sender, reward), "Creator transfer failed");
                emit CreatorRewardClaimed(dayId, msg.sender, reward);
            }
            
            VoterContribution storage contribution = voterContributions[dayId][msg.sender];
            if (!contribution.claimed && 
                contribution.totalVotes > 0 && 
                dailyTemplates[dayId].finalized) {
                
                uint256 totalDayVotes = _getTotalDayVotes(dayId);
                if (totalDayVotes > 0) {
                    uint256 voterReward = (dailyTemplates[dayId].voterPool * contribution.totalVotes) / totalDayVotes;
                    contribution.claimed = true;
                    require(frothToken.transfer(msg.sender, voterReward), "Voter transfer failed");
                    emit VoterRewardClaimed(dayId, msg.sender, voterReward);
                }
            }
        }
    }

    function _getTotalDayVotes(uint256 dayId) internal view returns (uint256) {
        uint256[] storage submissionIds = daySubmissionIds[dayId];
        uint256 total = 0;
        
        for (uint256 i = 0; i < submissionIds.length; i++) {
            total += submissions[submissionIds[i]].votes;
        }
        
        return total;
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    function getDaySubmissions(uint256 dayId) external view returns (uint256[] memory) {
        return daySubmissionIds[dayId];
    }

    function getSubmission(uint256 tokenId) external view returns (Submission memory) {
        require(submissions[tokenId].exists, "Submission does not exist");
        return submissions[tokenId];
    }

    function getDailyTemplate(uint256 dayId) external view returns (DailyTemplate memory) {
        return dailyTemplates[dayId];
    }

    function getRemainingVotes(uint256 tokenId, address user) external view returns (uint256) {
        Submission storage submission = submissions[tokenId];
        if (!submission.exists) return 0;
        
        uint256 used = userVotesOnSubmission[submission.dayId][tokenId];
        return maxVotesPerWallet > used ? maxVotesPerWallet - used : 0;
    }

    function getClaimableRewards(address user, uint256 dayId) external view returns (
        uint256 creatorReward,
        uint256 voterReward,
        bool voterClaimed
    ) {
        creatorReward = creatorRewards[dayId][user];
        
        VoterContribution storage contribution = voterContributions[dayId][user];
        voterClaimed = contribution.claimed;
        
        if (!voterClaimed && contribution.totalVotes > 0 && dailyTemplates[dayId].finalized) {
            uint256 totalDayVotes = _getTotalDayVotes(dayId);
            if (totalDayVotes > 0) {
                voterReward = (dailyTemplates[dayId].voterPool * contribution.totalVotes) / totalDayVotes;
            }
        }
    }

    // ============================================
    // NFT METADATA
    // ============================================

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        return string(abi.encodePacked(
            "https://app.immutabletype.com/api/comic-metadata/",
            tokenId.toString()
        ));
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    function manualSeedDay(uint256 dayId, uint256 seedAmount) external onlyOwner nonReentrant {
        DailyTemplate storage template = dailyTemplates[dayId];
        require(template.dayId == dayId, "Day not initialized");
        require(seedAmount > 0, "Seed amount must be > 0");
        
        require(
            frothToken.transferFrom(treasuryWallet, address(this), seedAmount),
            "Seed transfer failed"
        );
        
        template.creatorPool += (seedAmount * CREATOR_POOL_PCT) / 100;
        template.voterPool += (seedAmount * VOTER_POOL_PCT) / 100;
        template.treasuryCollected += seedAmount - 
                                      (seedAmount * CREATOR_POOL_PCT) / 100 - 
                                      (seedAmount * VOTER_POOL_PCT) / 100;
        
        emit DailyTemplateSeeded(dayId, seedAmount);
    }

    function setDailySeedAmount(uint256 newAmount) external onlyOwner {
        dailySeedAmount = newAmount;
        emit SeedAmountUpdated(newAmount);
    }

    function setEntryFee(uint256 newFee) external onlyOwner {
        entryFee = newFee;
        emit EntryFeeUpdated(newFee);
    }

    function setVoteCost(uint256 newCost) external onlyOwner {
        voteCost = newCost;
    }

    function setMaxVotesPerWallet(uint256 newMax) external onlyOwner {
        maxVotesPerWallet = newMax;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    // ============================================
    // UPGRADEABILITY
    // ============================================

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ============================================
    // OVERRIDES
    // ============================================

    function _exists(uint256 tokenId) internal view returns (bool) {
        return submissions[tokenId].exists;
    }
}