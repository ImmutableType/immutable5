// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IProfileNFT {
    function hasProfile(address owner) external view returns (bool);
}

interface IERC20Token {
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721Token {
    function balanceOf(address owner) external view returns (uint256);
}

contract BookmarkNFT is ERC721, ERC721Enumerable, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    // Constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 public constant MINT_FEE = 0.025 ether; // 0.025 FLOW
    uint256 public constant MAX_BATCH_SIZE = 5;
    uint256 public constant DAILY_LIMIT = 20;
    uint256 public constant BUFFAFLOW_REQUIREMENT = 100 * 10**18; // 100 tokens

    // Contract addresses
    address public immutable profileNFTAddress;
    address public immutable treasuryAddress;
    address public immutable buffaflowTokenAddress;
    address public immutable moonBuffaflowNFTAddress;

    // Data structures
    struct Bookmark {
        string title;
        string url;
        string description;
        address creator;
        uint256 createdAt;
    }

    // State variables
    mapping(uint256 => Bookmark) public bookmarks;
    mapping(address => mapping(uint256 => uint256)) public dailyMintCount; // user => day => count
    uint256 private _currentTokenId = 1;
    string private _baseTokenURI;

    // Events
    event BookmarkMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        string url,
        uint256 timestamp
    );

    event BatchMinted(
        address indexed creator,
        uint256[] tokenIds,
        uint256 count,
        uint256 timestamp
    );

    // Modifiers
    modifier qualifiedUser() {
        require(_isQualified(msg.sender), "Not qualified to mint");
        _;
    }

    modifier rateLimited(uint256 amount) {
        uint256 today = block.timestamp / 86400;
        require(
            dailyMintCount[msg.sender][today] + amount <= DAILY_LIMIT,
            "Daily limit exceeded"
        );
        _;
        dailyMintCount[msg.sender][today] += amount;
    }

    modifier validBatch(
        string[] memory titles,
        string[] memory urls,
        string[] memory descriptions
    ) {
        require(titles.length > 0 && titles.length <= MAX_BATCH_SIZE, "Invalid batch size");
        require(
            titles.length == urls.length && titles.length == descriptions.length,
            "Array length mismatch"
        );
        _;
    }

    constructor(
        address _profileNFTAddress,
        address _treasuryAddress,
        address _buffaflowTokenAddress,
        address _moonBuffaflowNFTAddress,
        string memory _initialBaseURI
    ) ERC721("ImmutableType Bookmarks", "ITBM") {
        require(_profileNFTAddress != address(0), "Invalid ProfileNFT address");
        require(_treasuryAddress != address(0), "Invalid treasury address");
        require(_buffaflowTokenAddress != address(0), "Invalid BUFFAFLOW address");
        require(_moonBuffaflowNFTAddress != address(0), "Invalid MoonBuffaflow address");

        profileNFTAddress = _profileNFTAddress;
        treasuryAddress = _treasuryAddress;
        buffaflowTokenAddress = _buffaflowTokenAddress;
        moonBuffaflowNFTAddress = _moonBuffaflowNFTAddress;
        _baseTokenURI = _initialBaseURI;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Main minting function
    function mintBookmarks(
        string[] memory titles,
        string[] memory urls,
        string[] memory descriptions
    )
        external
        payable
        nonReentrant
        qualifiedUser
        rateLimited(titles.length)
        validBatch(titles, urls, descriptions)
    {
        require(msg.value >= MINT_FEE, "Insufficient fee");

        // Send fee to treasury
        payable(treasuryAddress).transfer(MINT_FEE);

        // Refund excess payment
        if (msg.value > MINT_FEE) {
            payable(msg.sender).transfer(msg.value - MINT_FEE);
        }

        uint256[] memory mintedTokenIds = new uint256[](titles.length);

        for (uint256 i = 0; i < titles.length; i++) {
            require(_isValidString(titles[i], 1, 100), "Invalid title");
            require(_isValidURL(urls[i]), "Invalid URL");
            require(bytes(descriptions[i]).length <= 300, "Description too long");

            uint256 tokenId = _currentTokenId;
            _currentTokenId++;

            bookmarks[tokenId] = Bookmark({
                title: titles[i],
                url: urls[i],
                description: descriptions[i],
                creator: msg.sender,
                createdAt: block.timestamp
            });

            _safeMint(msg.sender, tokenId);
            mintedTokenIds[i] = tokenId;

            emit BookmarkMinted(tokenId, msg.sender, titles[i], urls[i], block.timestamp);
        }

        emit BatchMinted(msg.sender, mintedTokenIds, titles.length, block.timestamp);
    }

    // View functions
    function getUserBookmarks(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(user, i);
        }
        
        return tokenIds;
    }

    function getBookmark(uint256 tokenId) external view returns (Bookmark memory) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Bookmark does not exist");
        return bookmarks[tokenId];
    }

    function getUserDailyMintCount(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 86400;
        return dailyMintCount[user][today];
    }

    function getRemainingDailyMints(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 86400;
        uint256 used = dailyMintCount[user][today];
        return used >= DAILY_LIMIT ? 0 : DAILY_LIMIT - used;
    }

    function isQualified(address user) external view returns (bool) {
        return _isQualified(user);
    }

    function totalBookmarks() external view returns (uint256) {
        return _currentTokenId - 1;
    }

    // Internal functions
    function _isQualified(address user) internal view returns (bool) {
        // Must have a profile
        if (!IProfileNFT(profileNFTAddress).hasProfile(user)) {
            return false;
        }

        // Must have 100+ BUFFAFLOW tokens OR 1+ MoonBuffaflow NFT
        bool hasBuffaflow = IERC20Token(buffaflowTokenAddress).balanceOf(user) >= BUFFAFLOW_REQUIREMENT;
        bool hasMoonNFT = IERC721Token(moonBuffaflowNFTAddress).balanceOf(user) > 0;

        return hasBuffaflow || hasMoonNFT;
    }

    function _isValidString(string memory str, uint256 minLength, uint256 maxLength) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length < minLength || strBytes.length > maxLength) {
            return false;
        }
        
        // Check for whitespace-only strings
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] != 0x20) { // Not a space
                return true;
            }
        }
        return false; // All whitespace
    }

    function _isValidURL(string memory url) internal pure returns (bool) {
        bytes memory urlBytes = bytes(url);
        if (urlBytes.length < 8 || urlBytes.length > 500) {
            return false;
        }
        
        // Check if starts with http:// or https://
        return (
            _startsWith(urlBytes, "http://") || 
            _startsWith(urlBytes, "https://")
        );
    }

    function _startsWith(bytes memory str, string memory prefix) internal pure returns (bool) {
        bytes memory prefixBytes = bytes(prefix);
        if (str.length < prefixBytes.length) {
            return false;
        }
        
        for (uint256 i = 0; i < prefixBytes.length; i++) {
            if (str[i] != prefixBytes[i]) {
                return false;
            }
        }
        
        return true;
    }

    // Admin functions
    function setBaseURI(string memory newBaseURI) external onlyRole(ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
    }

    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        payable(treasuryAddress).transfer(address(this).balance);
    }

    // Override functions
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "URI query for nonexistent token");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString()))
            : "";
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}