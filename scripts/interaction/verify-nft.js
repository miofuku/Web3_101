const hre = require("hardhat");
const axios = require('axios');
const { getContractAddress } = require('../utils/contracts');
require('dotenv').config();

const IPFS_GATEWAYS = [
    "https://nftstorage.link/ipfs/",      // NFT.Storage gateway (most reliable)
    "https://ipfs.filebase.io/ipfs/",     // Filebase gateway
    "https://gateway.pinata.cloud/ipfs/",  // Pinata gateway
    "https://ipfs.infura.io/ipfs/",       // Infura gateway
    "https://dweb.link/ipfs/"             // Protocol Labs gateway
];

async function tryFetchFromGateways(ipfsHash) {
    for (const gateway of IPFS_GATEWAYS) {
        try {
            console.log(`Trying gateway: ${gateway}`);
            const response = await axios.get(`${gateway}${ipfsHash}`, {
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'TravelDApp/1.0'
                }
            });
            console.log(`Successfully fetched from ${gateway}`);
            return response.data;
        } catch (error) {
            console.log(`Gateway ${gateway} failed: ${error.message}`);
            continue;
        }
    }
    throw new Error("All IPFS gateways failed");
}

async function verifyNFTs(travelNFT, address) {
    const balance = await travelNFT.balanceOf(address);
    console.log("NFT balance for", address, ":", balance.toString());

    if (balance.toString() === "0") {
        console.log("No NFTs found for this address");
        return;
    }

    console.log("\nFinding all tokens owned by address...");
    let foundTokens = 0;
    let maxTokenId = 10; // Reasonable limit

    for (let tokenId = 1; foundTokens < parseInt(balance.toString()) && tokenId <= maxTokenId; tokenId++) {
        try {
            const owner = await travelNFT.ownerOf(tokenId);
            if (owner.toLowerCase() === address.toString().toLowerCase()) {
                foundTokens++;
                console.log(`\nFound token ID ${tokenId} owned by address`);
                
                const tokenURI = await travelNFT.tokenURI(tokenId);
                console.log("Token URI:", tokenURI);

                if (tokenURI === "ipfs://QmExample") {
                    console.log("This token has a placeholder URI.");
                    continue;
                }

                const ipfsHash = tokenURI.replace("ipfs://", "");
                console.log("Fetching metadata for hash:", ipfsHash);
                
                const metadata = await tryFetchFromGateways(ipfsHash);
                console.log("\nNFT Metadata:");
                console.log(JSON.stringify(metadata, null, 2));

                if (metadata.image) {
                    const imageHash = metadata.image.replace("ipfs://", "");
                    console.log("\nVerifying image with hash:", imageHash);
                    await tryFetchFromGateways(imageHash);
                    console.log("\nImage verification successful!");
                }
            }
        } catch (error) {
            if (!error.message.includes("nonexistent token")) {
                console.error(`Error checking token ${tokenId}:`, error.message);
            }
        }
    }

    console.log(`\nVerification complete. Found ${foundTokens} tokens.`);
}

async function verifyToken(tokenId, travelNFT) {
    try {
        const owner = await travelNFT.ownerOf(tokenId);
        const tokenURI = await travelNFT.tokenURI(tokenId);
        console.log(`\nToken ID ${tokenId}:`);
        console.log("Owner:", owner);
        console.log("Token URI:", tokenURI);

        if (tokenURI === "ipfs://QmExample") {
            console.log("This token has a placeholder URI.");
            return;
        }

        const ipfsHash = tokenURI.replace("ipfs://", "");
        console.log("Fetching metadata for hash:", ipfsHash);
        
        const metadata = await tryFetchFromGateways(ipfsHash);
        console.log("\nNFT Metadata:");
        console.log(JSON.stringify(metadata, null, 2));

        if (metadata.image) {
            const imageHash = metadata.image.replace("ipfs://", "");
            console.log("\nVerifying image with hash:", imageHash);
            await tryFetchFromGateways(imageHash);
            console.log("\nImage verification successful!");
        }
    } catch (error) {
        console.error("Error verifying token:", error.message);
    }
}

async function main() {
    const [owner, traveler] = await hre.ethers.getSigners();
    const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
    const travelNFT = TravelNFT.attach(getContractAddress('TravelNFT'));

    try {
        const action = process.argv[2] || 'all';
        const param = process.argv[3] || traveler.address;

        switch (action.toLowerCase()) {
            case 'token':
                await verifyToken(parseInt(param), travelNFT);
                break;

            case 'address':
                await verifyNFTs(travelNFT, param);
                break;

            case 'all':
                await verifyNFTs(travelNFT, traveler.address);
                break;

            default:
                console.log("Unknown action. Available actions: token, address, all");
                console.log("Usage:");
                console.log("  verify token <tokenId>");
                console.log("  verify address <address>");
                console.log("  verify all");
        }
    } catch (error) {
        console.error("Error:", error.message);
        if (error.reason) console.error("Reason:", error.reason);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 