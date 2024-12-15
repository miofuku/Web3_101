const fs = require('fs');
const path = require('path');
const { CONTRACT_ADDRESSES } = require('../utils/contracts');

async function prepareDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function copyABIs(contractsDir, artifacts) {
    for (const artifact of artifacts) {
        const artifactPath = path.join(
            __dirname,
            "..",
            "artifacts",
            "contracts",
            `${artifact}.sol`,
            `${artifact}.json`
        );
        
        try {
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
}

async function main() {
    const environment = process.argv[2] || 'development';
    console.log(`Preparing frontend files for ${environment} environment...`);

    // Create contracts directory
    const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
    await prepareDirectory(contractsDir);

    // Write contract addresses
    const addressesPath = path.join(contractsDir, "addresses.json");
    fs.writeFileSync(
        addressesPath,
        JSON.stringify({ 
            ...CONTRACT_ADDRESSES,
            environment 
        }, null, 2)
    );
    console.log("Contract addresses written to:", addressesPath);

    // Copy contract ABIs
    const artifacts = ["TravelNFT", "TravelToken", "TravelSBT"];
    await copyABIs(contractsDir, artifacts);

    // Create environment-specific config
    const configPath = path.join(__dirname, "..", "frontend", "src", "config.js");
    const config = {
        environment,
        ipfsGateway: "https://nftstorage.link/ipfs/",
        networkId: environment === 'development' ? 1337 : 1,
        networkName: environment === 'development' ? 'Ganache' : 'Ethereum Mainnet'
    };

    fs.writeFileSync(configPath, `export default ${JSON.stringify(config, null, 2)};`);
    console.log("Frontend configuration written to:", configPath);

    console.log("Frontend files prepared successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 