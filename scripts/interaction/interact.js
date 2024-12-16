const hre = require("hardhat");
const IPFSHandler = require('../../frontend/src/utils/ipfsHandler');
const path = require('path');
const { getContractAddress } = require('../utils/contracts');
require('dotenv').config();

const LOCATIONS = {
    MOUNT_FUJI: {
        name: "Mount Fuji",
        country: "Japan",
        coordinates: "35.3606° N, 138.7278° E",
        imagePath: path.join(__dirname, "../assets/mount-fuji.jpeg")
    },
    EIFFEL_TOWER: {
        name: "Eiffel Tower",
        country: "France",
        coordinates: "48.8584° N, 2.2945° E",
        imagePath: path.join(__dirname, "../assets/eiffel-tower.jpeg")
    }
};

// Interaction functions
async function mintNFTWithMetadata(travelNFT, ipfsHandler, location, traveler) {
    console.log(`\nMinting NFT for ${location.name}...`);
    console.log("Image path:", location.imagePath);
    
    const tokenURI = await ipfsHandler.createLocationNFTMetadata(
        location.name,
        location.country,
        location.coordinates,
        location.imagePath
    );
    console.log("Metadata uploaded, tokenURI:", tokenURI);

    const mintTx = await travelNFT.mintLocationNFT(
        traveler.address,
        location.name,
        location.country,
        location.coordinates,
        tokenURI,
        0
    );
    const receipt = await mintTx.wait();
    console.log("NFT minted successfully!");
    console.log("Transaction hash:", receipt.hash);
    return tokenURI;
}

async function mintTokens(travelToken, amount, recipient) {
    console.log(`\nMinting ${amount} tokens for ${recipient.address}...`);
    const rewardAmount = hre.ethers.parseEther(amount.toString());
    const rewardTx = await travelToken.rewardForVisit(recipient.address, rewardAmount);
    await rewardTx.wait();
    console.log(`Rewarded ${amount} tokens to ${recipient.address}`);
}

async function mintSBT(travelSBT, milestoneType, recipient) {
    console.log(`\nMinting SBT type ${milestoneType} for ${recipient.address}...`);
    const sbtTx = await travelSBT.mintMilestoneSBT(recipient.address, milestoneType);
    await sbtTx.wait();
    console.log(`Minted SBT type ${milestoneType} for ${recipient.address}`);
}

async function checkBalances(travelNFT, travelToken, travelSBT, address) {
    console.log(`\nChecking balances for ${address}...`);
    const nftBalance = await travelNFT.balanceOf(address);
    const tokenBalance = await travelToken.balanceOf(address);
    const sbtBalance = await travelSBT.balanceOf(address);

    console.log("Balances:");
    console.log("NFTs:", nftBalance.toString());
    console.log("Tokens:", hre.ethers.formatEther(tokenBalance));
    console.log("SBTs:", sbtBalance.toString());

    // Print NFT details - using sequential token ID check
    console.log("\nNFT Details:");
    let foundTokens = 0;
    for (let tokenId = 1; foundTokens < parseInt(nftBalance.toString()); tokenId++) {
        try {
            const owner = await travelNFT.ownerOf(tokenId);
            if (owner.toLowerCase() === address.toLowerCase()) {
                foundTokens++;
                const uri = await travelNFT.tokenURI(tokenId);
                console.log(`Token ID ${tokenId}: ${uri}`);
            }
        } catch (error) {
            if (!error.message.includes("nonexistent token")) {
                console.error(`Error checking token ${tokenId}:`, error.message);
            }
            // Stop checking if we've gone too far without finding all tokens
            if (tokenId > 100) {
                console.log("Stopping search after checking 100 token IDs");
                break;
            }
        }
    }
}

async function main() {
    const [owner, traveler] = await hre.ethers.getSigners();

    // Initialize contracts
    const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
    const TravelToken = await hre.ethers.getContractFactory("TravelToken");
    const TravelSBT = await hre.ethers.getContractFactory("TravelSBT");

    const travelNFT = TravelNFT.attach(getContractAddress('TravelNFT'));
    const travelToken = TravelToken.attach(getContractAddress('TravelToken'));
    const travelSBT = TravelSBT.attach(getContractAddress('TravelSBT'));

    console.log("Using contracts:");
    console.log("NFT:", await travelNFT.getAddress());
    console.log("Token:", await travelToken.getAddress());
    console.log("SBT:", await travelSBT.getAddress());

    try {
        // Get action from environment variable or default to 'all'
        const action = process.env.ACTION || 'all';
        
        // Initialize IPFS handler
        const ipfsHandler = new IPFSHandler(
            process.env.PINATA_API_KEY,
            process.env.PINATA_API_SECRET
        );

        switch (action.toLowerCase()) {
            case 'mintnft':
                const location = process.env.LOCATION || 'MOUNT_FUJI';
                await mintNFTWithMetadata(travelNFT, ipfsHandler, LOCATIONS[location], traveler);
                break;

            case 'minttoken':
                const amount = process.env.AMOUNT || 100;
                await mintTokens(travelToken, amount, traveler);
                break;

            case 'mintsbt':
                const milestoneType = process.env.MILESTONE_TYPE || 1;
                await mintSBT(travelSBT, milestoneType, traveler);
                break;

            case 'balance':
                await checkBalances(travelNFT, travelToken, travelSBT, traveler);
                break;

            case 'all':
                // Mint NFTs for different locations
                await mintNFTWithMetadata(travelNFT, ipfsHandler, LOCATIONS.MOUNT_FUJI, traveler);
                await mintNFTWithMetadata(travelNFT, ipfsHandler, LOCATIONS.EIFFEL_TOWER, traveler);
                await mintTokens(travelToken, 100, traveler);
                await mintSBT(travelSBT, 1, traveler);
                await checkBalances(travelNFT, travelToken, travelSBT, traveler);
                break;

            default:
                console.log("Unknown action. Available actions: mintNFT, mintToken, mintSBT, balance, all");
        }

    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 