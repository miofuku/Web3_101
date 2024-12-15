const hre = require("hardhat");
const axios = require('axios');
const { getContractAddress } = require('../utils/contracts');

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
            const url = `${gateway}${ipfsHash}`;
            console.log(`Trying gateway: ${gateway}`);
            
            const response = await axios.get(url, {
                timeout: 10000, // Increased timeout to 10 seconds
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'TravelDApp/1.0'
                }
            });
            
            if (response.status === 200) {
                console.log(`Successfully fetched from ${gateway}`);
                return response.data;
            }
        } catch (error) {
            console.log(`Gateway ${gateway} failed:`, error.message);
            continue;
        }
    }
    throw new Error("All gateways failed");
}

async function main() {
    const [owner, traveler] = await hre.ethers.getSigners();

    // Get the deployed NFT contract using utils
    const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
    const travelNFT = TravelNFT.attach(getContractAddress('TravelNFT'));

    try {
        // Get token count
        const balance = await travelNFT.balanceOf(traveler.address);
        console.log("NFT balance for", traveler.address, ":", balance.toString());

        if (balance.toString() === "0") {
            console.log("No NFTs found for this address");
            return;
        }

        let foundTokens = 0;
        console.log("\nFinding all tokens owned by traveler...");
        
        // Only check up to the number of tokens the traveler owns
        for (let i = 1; foundTokens < parseInt(balance.toString()); i++) {
            try {
                const owner = await travelNFT.ownerOf(i);
                if (owner.toLowerCase() === traveler.address.toLowerCase()) {
                    foundTokens++;
                    console.log(`\nFound token ID ${i} owned by traveler`);
                    const tokenURI = await travelNFT.tokenURI(i);
                    console.log("Token URI:", tokenURI);

                    if (tokenURI === "ipfs://QmExample") {
                        console.log("This token has a placeholder URI. Checking next token...");
                        continue;
                    }

                    // Convert IPFS URI to HTTP URL
                    const ipfsHash = tokenURI.replace("ipfs://", "");
                    console.log("Fetching metadata for hash:", ipfsHash);
                    
                    // Try to fetch metadata from multiple gateways
                    const metadata = await tryFetchFromGateways(ipfsHash);
                    console.log("\nNFT Metadata:");
                    console.log(JSON.stringify(metadata, null, 2));

                    // Verify image
                    if (metadata.image) {
                        const imageHash = metadata.image.replace("ipfs://", "");
                        console.log("\nVerifying image with hash:", imageHash);
                        try {
                            await tryFetchFromGateways(imageHash);
                            console.log("\nImage verification successful!");
                        } catch (error) {
                            console.log("\nImage verification failed:", error.message);
                        }
                    }
                }
            } catch (error) {
                if (!error.message.includes("nonexistent token") && 
                    !error.message.includes("VM Exception")) {
                    console.error(`Error checking token ${i}:`, error.message);
                }
                // Stop if we've gone too far without finding all tokens
                if (i > 100) {
                    console.log("\nStopping search after checking 100 token IDs");
                    break;
                }
            }
        }

        console.log(`\nVerification complete. Found ${foundTokens} tokens.`);

    } catch (error) {
        console.error("Error:", error.message);
        if (error.reason) {
            console.error("Reason:", error.reason);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 