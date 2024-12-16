const hre = require("hardhat");
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

async function verifyNFTs(travelNFT, address) {
    console.log("NFT balance for", address, ":", (await travelNFT.balanceOf(address)).toString());

    if ((await travelNFT.balanceOf(address)).toString() === "0") {
        console.log("No NFTs found for this address");
        return;
    }

    let foundTokens = 0;
    console.log("\nFinding all tokens owned by address...");
    
    // Only check up to the number of tokens owned
    for (let i = 1; foundTokens < parseInt((await travelNFT.balanceOf(address)).toString()); i++) {
        try {
            const owner = await travelNFT.ownerOf(i);
            if (owner.toLowerCase() === address.toLowerCase()) {
                foundTokens++;
                console.log(`\nFound token ID ${i} owned by address`);
                const tokenURI = await travelNFT.tokenURI(i);
                console.log("Token URI:", tokenURI);

                if (tokenURI === "ipfs://QmExample") {
                    console.log("This token has a placeholder URI. Checking next token...");
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
            if (!error.message.includes("nonexistent token") && 
                !error.message.includes("VM Exception")) {
                console.error(`Error checking token ${i}:`, error.message);
            }
            if (i > 100) {
                console.log("\nStopping search after checking 100 token IDs");
                break;
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