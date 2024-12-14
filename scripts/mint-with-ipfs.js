const hre = require("hardhat");
const IPFSHandler = require('./ipfsHandler');
const path = require('path');

async function main() {
    const [owner, traveler] = await hre.ethers.getSigners();

    // Initialize IPFS handler
    const ipfsHandler = new IPFSHandler(
        process.env.PINATA_API_KEY,
        process.env.PINATA_API_SECRET
    );

    // Get the deployed NFT contract
    const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
    const travelNFT = TravelNFT.attach("0x3653Cdfd41DC5fA028cEB2BA4A1E6A95258fCfd8");

    // Example location data
    const locationData = {
        name: "Mount Fuji",
        country: "Japan",
        coordinates: "35.3606° N, 138.7278° E",
        imagePath: path.join(__dirname, "../assets/mount-fuji.jpeg")
    };

    try {
        // Create and upload metadata
        console.log("Uploading to IPFS...");
        const tokenURI = await ipfsHandler.createLocationNFTMetadata(
            locationData.name,
            locationData.country,
            locationData.coordinates,
            locationData.imagePath
        );

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

        await mintTx.wait();
        console.log("NFT minted successfully!");
        console.log("Token URI:", tokenURI);

    } catch (error) {
        console.error("Error:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 