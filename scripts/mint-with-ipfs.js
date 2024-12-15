const hre = require("hardhat");
const IPFSHandler = require('./ipfsHandler');
const path = require('path');
const { getContractAddress } = require('../utils/contracts');
require('dotenv').config();

async function main() {
    try {
        const [owner, traveler] = await hre.ethers.getSigners();

        console.log("Using account:", owner.address);

        // Initialize IPFS handler
        const ipfsHandler = new IPFSHandler(
            process.env.PINATA_API_KEY,
            process.env.PINATA_API_SECRET
        );

        // Get the deployed NFT contract using utils
        const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
        const travelNFT = TravelNFT.attach(getContractAddress('TravelNFT'));

        console.log("NFT Contract address:", await travelNFT.getAddress());

        // Example location data
        const locationData = {
            name: "Mount Fuji",
            country: "Japan",
            coordinates: "35.3606° N, 138.7278° E",
            imagePath: path.join(__dirname, "../assets/mount-fuji.jpeg")
        };

        // Create and upload metadata
        console.log("Uploading to IPFS...");
        console.log("Image path:", locationData.imagePath);
        
        const tokenURI = await ipfsHandler.createLocationNFTMetadata(
            locationData.name,
            locationData.country,
            locationData.coordinates,
            locationData.imagePath
        );

        console.log("Metadata uploaded, tokenURI:", tokenURI);

        // Mint NFT with the IPFS metadata
        console.log("Minting NFT...");
        const mintTx = await travelNFT.mintLocationNFT(
            traveler.address,
            locationData.name,
            locationData.country,
            locationData.coordinates,
            tokenURI,
            0 // NFTType.COLLECTIBLE
        );

        console.log("Waiting for transaction...");
        const receipt = await mintTx.wait();
        console.log("NFT minted successfully!");
        console.log("Transaction hash:", receipt.hash);
        console.log("Token URI:", tokenURI);

    } catch (error) {
        console.error("Error details:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 