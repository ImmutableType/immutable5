// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../interfaces/ITokenQualifier.sol";

/**
 * @title ProfileNFT
 * @dev Tiered identity verification system with transferable profiles
 * Fixed to properly handle fee payments and 4-parameter profile creation
 */
contract ProfileNFT is ERC721, AccessControl, ReentrancyGuard {
    using Strings for uint256;
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Tier constants
    uint256 public constant TIER_BASIC = 0;
    uint256 public constant TIER_SOCIAL = 1;
    uint256 public constant TIER_IDENTITY = 2;
    uint256 public constant TIER_ANONYMOUS = 3;
    uint256 public constant MAX_TIER = 4;
    
    // Fee constants
    uint256 public constant BASIC_PROFILE_FEE = 3 ether; // 3 FLOW
    
    // Contract dependencies
    ITokenQualifier public tokenQualifier;
    
    // Profile data structures
    struct Profile {
        uint256 tier;
        string did;
        string displayName;
        string bio;
        string location;
        string avatarUrl;
        uint256 createdAt;
        uint256 lastTierUpgrade;
        bool isActive;
        bytes32 socialGraphHash;
        uint256 connectionCount;
        uint256 lastSocialUpdate;
    }
    
    struct AuthBinding {
        string method;
        string externalId;
        uint256 verifiedAt;
        bool isActive;
    }
    
    // Storage
    mapping(uint256 => Profile) private profiles;
    mapping(uint256 => AuthBinding[]) private authBindings;
    mapping(address => uint256) public addressToProfileId;
    mapping(uint256 => bool) public usedFarcasterFids;
    mapping(string => bool) public usedCrossmintIds;
    
    // Counters
    uint256 private nextProfileId = 1;
    
    // Events
    event ProfileCreated(uint256 indexed profileId, address indexed owner, uint256 tier);
    event ProfileUpdated(uint256 indexed profileId, address indexed owner);
    event TierAdvanced(uint256 indexed profileId, address indexed owner, uint256 oldTier, uint256 newTier, string method);
    event ProfileTransferred(uint256 indexed profileId, address indexed from, address indexed to);
    event ProfileSuspended(uint256 indexed profileId, address indexed admin);
    event AuthBindingAdded(uint256 indexed profileId, string method, string externalId);
    event AuthBindingDeactivated(uint256 indexed profileId, string method);
    event FeePaymentReceived(uint256 indexed profileId, address indexed payer, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        address _tokenQualifier
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        
        tokenQualifier = ITokenQualifier(_tokenQualifier);
    }
    
    // Modifiers
    modifier onlyProfileOwner(uint256 profileId) {
        require(ownerOf(profileId) == msg.sender, "Not profile owner");
        _;
    }
    
    modifier profileExists(uint256 profileId) {
        require(_ownerOf(profileId) != address(0), "Profile does not exist");
        _;
    }
    
    modifier validTier(uint256 tier) {
        require(tier <= MAX_TIER, "Invalid tier");
        _;
    }
    
    modifier oneProfilePerAddress() {
        require(addressToProfileId[msg.sender] == 0, "Address already has profile");
        _;
    }
    
    /**
     * @dev Create basic Tier 0 profile with proper fee handling
     */
    function createBasicProfile(
        string memory displayName,
        string memory bio,
        string memory location,
        string memory avatarUrl
    ) external payable oneProfilePerAddress nonReentrant returns (uint256) {
        require(bytes(displayName).length >= 1 && bytes(displayName).length <= 50, "Invalid display name length");
        require(bytes(bio).length <= 500, "Bio too long");
        require(bytes(location).length <= 100, "Location too long");
        require(bytes(avatarUrl).length <= 500, "Avatar URL too long");
        
        // Fee validation: Either have qualifying tokens OR pay 3 FLOW
        bool hasQualifyingTokens = false;
        
        // Check if TokenQualifier contract is properly configured
        try tokenQualifier.hasQualifyingTokens(msg.sender, TIER_BASIC) returns (bool qualified) {
            hasQualifyingTokens = qualified;
        } catch {
            // If TokenQualifier fails, assume no qualifying tokens
            hasQualifyingTokens = false;
        }
        
        if (hasQualifyingTokens) {
            // User has qualifying tokens - no fee required
            require(msg.value == 0, "No fee required with qualifying tokens");
        } else {
            // User doesn't have qualifying tokens - must pay fee
            require(msg.value >= BASIC_PROFILE_FEE, "Must pay 3 FLOW fee");
        }
        
        uint256 profileId = nextProfileId++;
        
        // Generate W3C compliant DID
        string memory did = string(abi.encodePacked(
            "did:pkh:eip155:545:",
            Strings.toHexString(uint160(msg.sender), 20)
        ));
        
        // Create profile
        profiles[profileId] = Profile({
            tier: TIER_BASIC,
            did: did,
            displayName: displayName,
            bio: bio,
            location: location,
            avatarUrl: avatarUrl,
            createdAt: block.timestamp,
            lastTierUpgrade: block.timestamp,
            isActive: true,
            socialGraphHash: bytes32(0),
            connectionCount: 0,
            lastSocialUpdate: 0
        });
        
        // Add wallet auth binding
        authBindings[profileId].push(AuthBinding({
            method: "wallet",
            externalId: Strings.toHexString(uint160(msg.sender), 20),
            verifiedAt: block.timestamp,
            isActive: true
        }));
        
        // Mint NFT
        _mint(msg.sender, profileId);
        addressToProfileId[msg.sender] = profileId;
        
        emit ProfileCreated(profileId, msg.sender, TIER_BASIC);
        emit AuthBindingAdded(profileId, "wallet", Strings.toHexString(uint160(msg.sender), 20));
        
        if (msg.value > 0) {
            emit FeePaymentReceived(profileId, msg.sender, msg.value);
        }
        
        return profileId;
    }
    
    /**
     * @dev Advance to Tier 1 via Farcaster verification
     */
    function stepUpWithFarcaster(
        uint256 profileId,
        uint256 fid,
        bytes memory proof
    ) external payable onlyProfileOwner(profileId) nonReentrant {
        require(profiles[profileId].tier == TIER_BASIC, "Must be Tier 0");
        require(fid > 0, "Invalid Farcaster FID");
        require(!usedFarcasterFids[fid], "FID already used");
        require(proof.length > 0, "Proof required");
        
        // Update profile tier
        profiles[profileId].tier = TIER_SOCIAL;
        profiles[profileId].lastTierUpgrade = block.timestamp;
        usedFarcasterFids[fid] = true;
        
        // Add Farcaster auth binding
        authBindings[profileId].push(AuthBinding({
            method: "farcaster",
            externalId: fid.toString(),
            verifiedAt: block.timestamp,
            isActive: true
        }));
        
        emit TierAdvanced(profileId, msg.sender, TIER_BASIC, TIER_SOCIAL, "farcaster");
        emit AuthBindingAdded(profileId, "farcaster", fid.toString());
    }
    
    /**
     * @dev Advance to Tier 2 via Crossmint KYC verification
     */
    function stepUpWithCrossmint(
        uint256 profileId,
        string memory kycId,
        bytes memory proof
    ) external payable onlyProfileOwner(profileId) nonReentrant {
        require(profiles[profileId].tier <= TIER_SOCIAL, "Already higher tier");
        require(bytes(kycId).length > 0, "Invalid KYC ID");
        require(!usedCrossmintIds[kycId], "KYC ID already used");
        require(proof.length > 0, "Proof required");
        
        // Update profile tier
        profiles[profileId].tier = TIER_IDENTITY;
        profiles[profileId].lastTierUpgrade = block.timestamp;
        usedCrossmintIds[kycId] = true;
        
        // Add Crossmint auth binding
        authBindings[profileId].push(AuthBinding({
            method: "crossmint",
            externalId: kycId,
            verifiedAt: block.timestamp,
            isActive: true
        }));
        
        emit TierAdvanced(profileId, msg.sender, profiles[profileId].tier, TIER_IDENTITY, "crossmint");
        emit AuthBindingAdded(profileId, "crossmint", kycId);
    }
    
    /**
     * @dev Admin verification to any tier
     */
    function adminVerifyProfile(
        uint256 profileId,
        uint256 targetTier,
        string memory method
    ) external onlyRole(ADMIN_ROLE) profileExists(profileId) validTier(targetTier) {
        require(targetTier > profiles[profileId].tier, "Target tier must be higher");
        
        uint256 oldTier = profiles[profileId].tier;
        profiles[profileId].tier = targetTier;
        profiles[profileId].lastTierUpgrade = block.timestamp;
        
        emit TierAdvanced(profileId, ownerOf(profileId), oldTier, targetTier, method);
    }
    
    /**
     * @dev Update profile information
     */
    function updateProfile(
        uint256 profileId,
        string memory displayName,
        string memory bio,
        string memory location,
        string memory avatarUrl
    ) external onlyProfileOwner(profileId) {
        require(profiles[profileId].isActive, "Profile suspended");
        require(bytes(displayName).length >= 1 && bytes(displayName).length <= 50, "Invalid display name");
        require(bytes(bio).length <= 500, "Bio too long");
        require(bytes(location).length <= 100, "Location too long");
        require(bytes(avatarUrl).length <= 500, "Avatar URL too long");
        
        Profile storage profile = profiles[profileId];
        profile.displayName = displayName;
        profile.bio = bio;
        profile.location = location;
        profile.avatarUrl = avatarUrl;
        
        emit ProfileUpdated(profileId, msg.sender);
    }
    
    /**
     * @dev Override transfer to reset personal data
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        if (from != address(0) && to != address(0)) {
            Profile storage profile = profiles[tokenId];
            profile.displayName = "Unnamed";
            profile.bio = "";
            profile.location = "";
            profile.avatarUrl = "";
            
            AuthBinding[] storage bindings = authBindings[tokenId];
            for (uint i = 0; i < bindings.length; i++) {
                bindings[i].isActive = false;
                emit AuthBindingDeactivated(tokenId, bindings[i].method);
            }
            
            if (addressToProfileId[from] == tokenId) {
                delete addressToProfileId[from];
            }
            addressToProfileId[to] = tokenId;
            
            emit ProfileTransferred(tokenId, from, to);
        }
        
        return super._update(to, tokenId, auth);
    }
    
    // View functions
    function getProfile(uint256 profileId) external view profileExists(profileId) returns (Profile memory) {
        return profiles[profileId];
    }
    
    function getProfileByAddress(address owner) external view returns (Profile memory) {
        uint256 profileId = addressToProfileId[owner];
        require(profileId != 0, "No profile found");
        return profiles[profileId];
    }
    
    function hasProfile(address owner) external view returns (bool) {
        return addressToProfileId[owner] != 0;
    }
    
    function totalProfiles() external view returns (uint256) {
        return nextProfileId - 1;
    }
    
    function getBasicProfileFee() external pure returns (uint256) {
        return BASIC_PROFILE_FEE;
    }
    
    // Admin functions
    function updateTokenQualifier(address _tokenQualifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenQualifier = ITokenQualifier(_tokenQualifier);
    }
    
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}