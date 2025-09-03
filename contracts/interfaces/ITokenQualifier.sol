// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITokenQualifier
 * @dev Interface for determining if an address qualifies for fee bypass via token holdings
 */
interface ITokenQualifier {
    /**
     * @dev Check if user has qualifying tokens for a tier advancement
     * @param user Address to check token holdings for
     * @param tierLevel Target tier level (1, 2, 3, etc.)
     * @return bool True if user has sufficient qualifying tokens
     */
    function hasQualifyingTokens(address user, uint256 tierLevel) external view returns (bool);
    
    /**
     * @dev Get required fee amount for tier advancement
     * @param tierLevel Target tier level
     * @return uint256 Fee amount in wei
     */
    function getRequiredFee(uint256 tierLevel) external view returns (uint256);
    
    /**
     * @dev Get list of qualifying token addresses for a tier
     * @param tierLevel Target tier level
     * @return address[] List of qualifying token contract addresses
     */
    function getQualifyingTokens(uint256 tierLevel) external view returns (address[] memory);
    
    /**
     * @dev Get minimum token balance required for tier qualification
     * @param tierLevel Target tier level
     * @param tokenAddress Specific token contract address
     * @return uint256 Minimum balance required
     */
    function getMinimumBalance(uint256 tierLevel, address tokenAddress) external view returns (uint256);
}