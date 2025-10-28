// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFrothTournament.sol";
import "./interfaces/IProfileNFT.sol";

/**
 * @title ComicNFT
 * @dev ERC721 NFTs for daily comic tournament submissions
 */
contract ComicNFT is ERC721, Ownable {
    IFrothTournament public tournament;
    IProfileNFT public profileNFT;
    uint256 private _nextTokenId = 1;
    
    uint256 public constant MAX_COMICS_PER_ENTRY = 5;
    uint256 public constant MAX_COMICS_PER_DAY = 25;
    
    struct Comic {
        address creator;
        uint256 dayId;
        uint256 timestamp;
        uint256[] characterIds;
        uint256 backgroundId;
        uint256 wordCloudId;
        uint256[][] wordIndices;
    }
    
    mapping(uint256 => Comic) public comics;
    mapping(uint256 => uint256[]) public comicsByDay;
    mapping(uint256 => mapping(address => uint256)) public userComicsCountByDay;
    
    event ComicMinted(
        address indexed creator,
        uint256 indexed tokenId,
        uint256 indexed dayId,
        uint256[] characterIds,
        uint256 backgroundId,
        uint256 wordCloudId
    );
    
    constructor(
        address _tournament,
        address _profileNFT
    ) ERC721("FROTH Comics", "FCOMIC") Ownable(msg.sender) {
        tournament = IFrothTournament(_tournament);
        profileNFT = IProfileNFT(_profileNFT);
    }
    
    function mintComic(
        uint256 dayId,
        uint256[] calldata characterIds,
        uint256 backgroundId,
        uint256 wordCloudId,
        uint256[][] calldata wordIndices
    ) external returns (uint256) {
        require(tournament.isSubmissionOpen(dayId), "Submissions closed");
        require(profileNFT.hasProfile(msg.sender), "Must have ImmutableType Profile");
        
        uint256 userEntries = tournament.getEntryCount(dayId, msg.sender);
        require(userEntries > 0, "Must enter tournament first");
        
        uint256 userComicsToday = userComicsCountByDay[dayId][msg.sender];
        uint256 maxAllowedComics = userEntries * MAX_COMICS_PER_ENTRY;
        require(userComicsToday < maxAllowedComics, "Max comics reached for your entries");
        require(userComicsToday < MAX_COMICS_PER_DAY, "Max 25 comics per day");
        
        require(characterIds.length == 4, "Must have 4 characters");
        for (uint256 i = 0; i < 4; i++) {
            require(characterIds[i] <= 12, "Invalid character ID");
        }
        require(backgroundId <= 4, "Invalid background ID");
        require(wordCloudId <= 10, "Invalid word cloud ID");
        
        require(wordIndices.length == 4, "Must have 4 panels");
        for (uint256 i = 0; i < 4; i++) {
            require(
                wordIndices[i].length >= 1 && wordIndices[i].length <= 10,
                "Panel must have 1-10 words"
            );
            
            for (uint256 j = 0; j < wordIndices[i].length; j++) {
                require(wordIndices[i][j] <= 161, "Invalid word index");
            }
        }
        
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        
        comics[tokenId] = Comic({
            creator: msg.sender,
            dayId: dayId,
            timestamp: block.timestamp,
            characterIds: characterIds,
            backgroundId: backgroundId,
            wordCloudId: wordCloudId,
            wordIndices: wordIndices
        });
        
        comicsByDay[dayId].push(tokenId);
        userComicsCountByDay[dayId][msg.sender]++;
        
        emit ComicMinted(msg.sender, tokenId, dayId, characterIds, backgroundId, wordCloudId);
        
        return tokenId;
    }
    
    function getComic(uint256 tokenId) external view returns (
        address creator,
        uint256 dayId,
        uint256 timestamp,
        uint256[] memory characterIds,
        uint256 backgroundId,
        uint256 wordCloudId,
        uint256[][] memory wordIndices
    ) {
        Comic storage comic = comics[tokenId];
        return (
            comic.creator,
            comic.dayId,
            comic.timestamp,
            comic.characterIds,
            comic.backgroundId,
            comic.wordCloudId,
            comic.wordIndices
        );
    }
    
    function getComicDay(uint256 tokenId) external view returns (uint256) {
        return comics[tokenId].dayId;
    }
    
    function getDayComics(uint256 dayId) external view returns (uint256[] memory) {
        return comicsByDay[dayId];
    }
    
    function getUserComicsForDay(uint256 dayId, address user) external view returns (uint256) {
        return userComicsCountByDay[dayId][user];
    }
    
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}