// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFrothTournament {
    function getEntryCount(uint256 dayId, address user) external view returns (uint256);
    function isSubmissionOpen(uint256 dayId) external view returns (bool);
}