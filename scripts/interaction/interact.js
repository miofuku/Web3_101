const hre = require("hardhat");
const path = require('path');
const fs = require('fs');
const { IPFSHandler, getContractAddress } = require('../utils');
require('dotenv').config();

const LOCATIONS = {
    MOUNT_FUJI: {
        name: "Mount Fuji",
        country: "Japan",
        coordinates: "35.3606° N, 138.7278° E",
        imagePath: path.join(__dirname, "../../assets/mount-fuji.jpeg")
    },
    EIFFEL_TOWER: {
        name: "Eiffel Tower",
        country: "France",
        coordinates: "48.8584° N, 2.2945° E",
        imagePath: path.join(__dirname, "../../assets/eiffel-tower.jpeg")
    }
};

// Interaction functions
async function mintNFTWithMetadata(travelNFT, ipfsHandler, location, traveler) {
    console.log(`\nMinting NFT for ${location.name}...`);
    console.log("Image path:", location.imagePath);
    
    try {
        // Verify IPFS handler is initialized
        if (!ipfsHandler) {
            throw new Error("IPFS Handler not initialized. Check Pinata credentials.");
        }

        // Check if image exists
        if (!fs.existsSync(location.imagePath)) {
            throw new Error(`Image not found at path: ${location.imagePath}`);
        }

        // Create and upload metadata
        const tokenURI = await ipfsHandler.createLocationNFTMetadata(
            location.name,
            location.country,
            location.coordinates,
            location.imagePath
        );

        if (!tokenURI) {
            throw new Error("Failed to create metadata: tokenURI is undefined");
        }

        console.log("Metadata uploaded, tokenURI:", tokenURI);

        // Mint NFT
        const mintTx = await travelNFT.mintLocationNFT(
            traveler.address,
            location.name,
            location.country,
            location.coordinates,
            tokenURI,
            0 // NFTType.COLLECTIBLE
        );
        const receipt = await mintTx.wait();
        console.log("NFT minted successfully!");
        console.log("Transaction hash:", receipt.hash);
        return tokenURI;
    } catch (error) {
        console.error("Error in mintNFTWithMetadata:", error);
        throw error;
    }
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
    let maxTokenId = 10; // Limit the search to reasonable range

    for (let tokenId = 1; foundTokens < parseInt(nftBalance.toString()) && tokenId <= maxTokenId; tokenId++) {
        try {
            const owner = await travelNFT.ownerOf(tokenId);
            // Convert addresses to strings for comparison
            if (owner.toLowerCase() === address.toString().toLowerCase()) {
                foundTokens++;
                const uri = await travelNFT.tokenURI(tokenId);
                console.log(`Token ID ${tokenId}: ${uri}`);
            }
        } catch (error) {
            if (!error.message.includes("nonexistent token") && 
                !error.message.includes("VM Exception")) {
                console.error(`Error checking token ${tokenId}:`, error.message);
            }
        }
    }

    if (foundTokens < parseInt(nftBalance.toString())) {
        console.log(`\nWarning: Only found ${foundTokens} tokens out of ${nftBalance.toString()}`);
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
        const recipient = process.argv[3] || traveler.address;

        // Initialize IPFS handler with credentials check
        if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
            throw new Error("Pinata credentials not found in environment variables");
        }
        
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
                await checkBalances(travelNFT, travelToken, travelSBT, recipient);
                break;

            case 'all':
                // Mint NFTs for different locations
                await mintNFTWithMetadata(travelNFT, ipfsHandler, LOCATIONS.MOUNT_FUJI, traveler);
                await mintNFTWithMetadata(travelNFT, ipfsHandler, LOCATIONS.EIFFEL_TOWER, traveler);
                await mintTokens(travelToken, 100, traveler);
                await mintSBT(travelSBT, 1, traveler);
                await checkBalances(travelNFT, travelToken, travelSBT, recipient);
                break;

            default:
                console.log("Unknown action. Available actions: mintNFT, mintToken, mintSBT, balance, all");
        }

    } catch (error) {
        console.error("Error in main:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exitCode = 1;
}); 