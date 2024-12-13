// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TravelSBT is ERC721 {
    constructor() ERC721("TravelSBT", "TSBT") {}
    
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Token is Soulbound - no transfers");
        return super._update(to, tokenId, auth);
    }
    
    function mintMilestoneSBT(
        address traveler,
        uint256 milestoneType
    ) public {
        // Only mint, cannot transfer
        _safeMint(traveler, milestoneType);
    }
} 