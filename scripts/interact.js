const hre = require("hardhat");
const IPFSHandler = require('./ipfsHandler');
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

async function mintNFTWithMetadata(travelNFT, ipfsHandler, location, traveler) {
    console.log(`\nMinting NFT for ${location.name}...`);
    console.log("Image path:", location.imagePath);
    
    // Create and upload metadata
    const tokenURI = await ipfsHandler.createLocationNFTMetadata(
        location.name,
        location.country,
        location.coordinates,
        location.imagePath
    );
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
        // Initialize IPFS handler
        const ipfsHandler = new IPFSHandler(
            process.env.PINATA_API_KEY,
            process.env.PINATA_API_SECRET
        );

        // Mint NFTs for different locations
        await mintNFTWithMetadata(travelNFT, ipfsHandler, LOCATIONS.MOUNT_FUJI, traveler);
        await mintNFTWithMetadata(travelNFT, ipfsHandler, LOCATIONS.EIFFEL_TOWER, traveler);

        // Reward tokens for the visits
        const rewardAmount = hre.ethers.parseEther("100");
        const rewardTx = await travelToken.rewardForVisit(traveler.address, rewardAmount);
        await rewardTx.wait();
        console.log("\nRewarded tokens:", hre.ethers.formatEther(rewardAmount));

        // Mint a milestone SBT
        const sbtTx = await travelSBT.mintMilestoneSBT(traveler.address, 1);
        await sbtTx.wait();
        console.log("Minted SBT for:", traveler.address);

        // Check balances
        const nftBalance = await travelNFT.balanceOf(traveler.address);
        const tokenBalance = await travelToken.balanceOf(traveler.address);
        const sbtBalance = await travelSBT.balanceOf(traveler.address);

        console.log("\nTraveler Balances:");
        console.log("NFTs:", nftBalance.toString());
        console.log("Tokens:", hre.ethers.formatEther(tokenBalance));
        console.log("SBTs:", sbtBalance.toString());

        // Print token URIs for all NFTs
        console.log("\nNFT Details:");
        for (let i = 1; i <= nftBalance; i++) {
            try {
                const tokenId = await travelNFT.tokenOfOwnerByIndex(traveler.address, i - 1);
                const uri = await travelNFT.tokenURI(tokenId);
                console.log(`Token ID ${tokenId}: ${uri}`);
            } catch (error) {
                console.error(`Error fetching token ${i}:`, error.message);
            }
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