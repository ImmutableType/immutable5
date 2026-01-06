// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IComicNFT {
    function getComicDay(uint256 tokenId) external view returns (uint256);
    function getDayComics(uint256 dayId) external view returns (uint256[] memory);
}
