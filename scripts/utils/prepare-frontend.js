const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    const environment = process.env.NODE_ENV || 'development';
    console.log(`Preparing frontend files for ${environment} environment...`);

    // Get addresses from environment variables
    const addresses = {
        TravelNFT: process.env.TRAVEL_NFT_ADDRESS,
        TravelToken: process.env.TRAVEL_TOKEN_ADDRESS,
        TravelSBT: process.env.TRAVEL_SBT_ADDRESS
    };

    // Verify addresses exist
    Object.entries(addresses).forEach(([name, address]) => {
        if (!address) {
            throw new Error(`Missing address for ${name} in environment variables`);
        }
        console.log(`${name} address: ${address}`);
    });

    // Create frontend directory
    const frontendDir = path.join(__dirname, "../../frontend");
    const contractsDir = path.join(frontendDir, "src", "contracts");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Write contract addresses only to src/contracts
    const addressesPath = path.join(contractsDir, "addresses.json");
    fs.writeFileSync(
        addressesPath,
        JSON.stringify(addresses, null, 2)
    );
    console.log("Contract addresses written to:", addressesPath);

    // Copy contract ABIs
    const artifacts = ["TravelNFT", "TravelToken", "TravelSBT"];
    for (const artifact of artifacts) {
        try {
            const artifactPath = path.join(
                __dirname,
                "../../artifacts/contracts",
                `${artifact}.sol`,
                `${artifact}.json`
            );
            
            const artifactData = require(artifactPath);
            fs.writeFileSync(
                path.join(contractsDir, `${artifact}.json`),
                JSON.stringify(artifactData.abi, null, 2)
            );
            console.log(`Copied ABI for ${artifact}`);
        } catch (error) {
            console.error(`Error copying ABI for ${artifact}:`, error.message);
        }
    }

    // Write config
    const configDir = path.join(frontendDir, "src", "config");
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, "index.js");
    const config = {
        environment,
        ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
        networkId: environment === 'development' ? 1337 : 1,
        networkName: environment === 'development' ? 'Ganache' : 'Ethereum Mainnet',
        contracts: addresses
    };

    fs.writeFileSync(
        configPath,
        `export default ${JSON.stringify(config, null, 2)};`
    );
    console.log("Frontend configuration written to:", configPath);

    // Copy Pinata credentials to frontend .env
    const frontendEnvPath = path.join(frontendDir, '.env');
    const envContent = `
REACT_APP_PINATA_API_KEY=${process.env.PINATA_API_KEY}
REACT_APP_PINATA_API_SECRET=${process.env.PINATA_API_SECRET}
    `.trim();
    
    fs.writeFileSync(frontendEnvPath, envContent + '\n');
    console.log("Frontend environment variables written to:", frontendEnvPath);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 