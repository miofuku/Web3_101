// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Add enum for NFT types
enum NFTType {
    COLLECTIBLE,    // Transferable
    ACHIEVEMENT,    // Transferable
    PERK           // Transferable
}

contract TravelNFT is ERC721URIStorage {
    struct Location {
        string name;
        string country;
        string coordinates;
        uint256 visitTimestamp;
    }
    
    mapping(uint256 => Location) public locations;
    uint256 private _tokenIds;
    // Add NFT type tracking
    mapping(uint256 => NFTType) public nftTypes;
    
    function mintLocationNFT(
        address traveler,
        string memory name,
        string memory country,
        string memory coordinates,
        string memory tokenURI,
        NFTType nftType
    ) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        
        _mint(traveler, newItemId);
        _setTokenURI(newItemId, tokenURI);
        nftTypes[newItemId] = nftType;
        
        locations[newItemId] = Location(
            name,
            country,
            coordinates,
            block.timestamp
        );
        
        return newItemId;
    }
} 