const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    const environment = process.env.NODE_ENV || 'development';
    console.log(`Preparing frontend files for ${environment} environment...`);

    const frontendDir = path.join(__dirname, "../../frontend");
    const contractsDir = path.join(frontendDir, "src", "contracts");
    const configDir = path.join(frontendDir, "src", "config");

    // Ensure directories exist
    [contractsDir, configDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Get contract addresses
    const addresses = {
        TravelNFT: process.env.TRAVEL_NFT_ADDRESS,
        TravelToken: process.env.TRAVEL_TOKEN_ADDRESS,
        TravelSBT: process.env.TRAVEL_SBT_ADDRESS
    };

    // Write contract addresses
    fs.writeFileSync(
        path.join(contractsDir, "addresses.json"),
        JSON.stringify(addresses, null, 2)
    );

    // Copy ABIs
    const artifacts = ["TravelNFT", "TravelToken", "TravelSBT"];
    for (const artifact of artifacts) {
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
    }

    // Write frontend config
    const config = {
        environment,
        ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
        networkId: environment === 'development' ? 1337 : 1,
        networkName: environment === 'development' ? 'Ganache' : 'Ethereum Mainnet'
    };

    fs.writeFileSync(
        path.join(configDir, "index.js"),
        `export default ${JSON.stringify(config, null, 2)};`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 