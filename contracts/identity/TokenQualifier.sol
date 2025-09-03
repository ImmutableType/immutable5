// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ITokenQualifier.sol";

/**
 * @title TokenQualifier
 * @dev Determines fee requirements and token qualifications for tier advancement
 */
contract TokenQualifier is ITokenQualifier, Ownable {
    
    // Fee structure
    mapping(uint256 => uint256) public tierFees;
    
    // Token qualifications: tier => token address => minimum balance
    mapping(uint256 => mapping(address => uint256)) public tokenRequirements;
    mapping(uint256 => address[]) public qualifyingTokensByTier;
    
    constructor() Ownable(msg.sender) {
        // Set default fees (can be updated by owner)
        tierFees[1] = 0.001 ether;  // Tier 1: 0.001 FLOW
        tierFees[2] = 0.01 ether;   // Tier 2: 0.01 FLOW
        tierFees[3] = 0.1 ether;    // Tier 3: 0.1 FLOW
    }
    
    function hasQualifyingTokens(address user, uint256 tierLevel) external view returns (bool) {
        address[] memory tokens = qualifyingTokensByTier[tierLevel];
        
        for (uint i = 0; i < tokens.length; i++) {
            address tokenAddress = tokens[i];
            uint256 required = tokenRequirements[tierLevel][tokenAddress];
            
            if (required > 0) {
                IERC20 token = IERC20(tokenAddress);
                if (token.balanceOf(user) >= required) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    function getRequiredFee(uint256 tierLevel) external view returns (uint256) {
        return tierFees[tierLevel];
    }
    
    function getQualifyingTokens(uint256 tierLevel) external view returns (address[] memory) {
        return qualifyingTokensByTier[tierLevel];
    }
    
    function getMinimumBalance(uint256 tierLevel, address tokenAddress) external view returns (uint256) {
        return tokenRequirements[tierLevel][tokenAddress];
    }
    
    // Admin functions
    function setTierFee(uint256 tierLevel, uint256 fee) external onlyOwner {
        tierFees[tierLevel] = fee;
    }
    
    function addQualifyingToken(
        uint256 tierLevel,
        address tokenAddress,
        uint256 minimumBalance
    ) external onlyOwner {
        require(tokenRequirements[tierLevel][tokenAddress] == 0, "Token already added");
        
        tokenRequirements[tierLevel][tokenAddress] = minimumBalance;
        qualifyingTokensByTier[tierLevel].push(tokenAddress);
    }
    
    function updateTokenRequirement(
        uint256 tierLevel,
        address tokenAddress,
        uint256 minimumBalance
    ) external onlyOwner {
        require(tokenRequirements[tierLevel][tokenAddress] > 0, "Token not found");
        tokenRequirements[tierLevel][tokenAddress] = minimumBalance;
    }
    
    function removeQualifyingToken(uint256 tierLevel, address tokenAddress) external onlyOwner {
        require(tokenRequirements[tierLevel][tokenAddress] > 0, "Token not found");
        
        delete tokenRequirements[tierLevel][tokenAddress];
        
        // Remove from array
        address[] storage tokens = qualifyingTokensByTier[tierLevel];
        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenAddress) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
}