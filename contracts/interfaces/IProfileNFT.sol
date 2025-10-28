// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProfileNFT {
    function hasProfile(address user) external view returns (bool);
}