// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TravelSBT is ERC721 {
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        require(from == address(0) || to == address(0), "Token is Soulbound - no transfers");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function mintMilestoneSBT(
        address traveler,
        uint256 milestoneType
    ) public {
        // Only mint, cannot transfer
        _safeMint(traveler, milestoneType);
    }
} 