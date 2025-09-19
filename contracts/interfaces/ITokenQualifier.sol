// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITokenQualifier
 * @dev Interface for determining if an address qualifies for fee bypass via token holdings
 */
interface ITokenQualifier {
    /**
     * @dev ADDED: Check if user is qualified for basic tier (Tier 0) profile creation
     */
    function isQualified(address user) external view returns (bool);
    
    /**
     * @dev ORIGINAL: Check if user has qualifying tokens for a tier advancement
     */
    function hasQualifyingTokens(address user, uint256 tierLevel) external view returns (bool);
    
    /**
     * @dev ORIGINAL: Get required fee amount for tier advancement
     */
    function getRequiredFee(uint256 tierLevel) external view returns (uint256);
    
    /**
     * @dev ORIGINAL: Get list of qualifying token addresses for a tier
     */
    function getQualifyingTokens(uint256 tierLevel) external view returns (address[] memory);
    
    /**
     * @dev ORIGINAL: Get minimum token balance required for tier qualification
     */
    function getMinimumBalance(uint256 tierLevel, address tokenAddress) external view returns (uint256);
}