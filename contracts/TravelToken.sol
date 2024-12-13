// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TravelToken is ERC20 {
    address public nftContract;
    
    constructor() ERC20("TravelToken", "TRAVEL") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    function rewardForVisit(address traveler, uint256 baseReward) public {
        // Reward logic for visits
        _mint(traveler, baseReward);
    }
    
    function rewardForQuest(address traveler, uint256 questId) public {
        // Quest completion reward logic
        uint256 questReward = calculateQuestReward(questId);
        _mint(traveler, questReward);
    }
} 