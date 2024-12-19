const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    const environment = process.env.NODE_ENV || 'development';
    const network = process.env.DEPLOY_NETWORK || 'ganache';
    console.log(`Preparing frontend files for ${environment} environment on ${network} network`);

    // Get addresses based on network
    const addresses = {
        TravelNFT: process.env[`${network.toUpperCase()}_TRAVEL_NFT_ADDRESS`],
        TravelToken: process.env[`${network.toUpperCase()}_TRAVEL_TOKEN_ADDRESS`],
        TravelSBT: process.env[`${network.toUpperCase()}_TRAVEL_SBT_ADDRESS`]
    };

    console.log('Using contract addresses:', addresses);

    const frontendDir = path.join(__dirname, "../../frontend");
    const contractsDir = path.join(frontendDir, "src", "contracts");
    const configDir = path.join(frontendDir, "src", "config");

    // Ensure directories exist
    [contractsDir, configDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Write contract addresses
    fs.writeFileSync(
        path.join(contractsDir, "addresses.json"),
        JSON.stringify(addresses, null, 2)
    );
    console.log('Contract addresses written to frontend');

    // Copy ABIs with verification
    const artifacts = ["TravelNFT", "TravelToken", "TravelSBT"];
    for (const artifact of artifacts) {
        try {
            const artifactPath = path.join(
                __dirname,
                "../../artifacts/contracts",
                `${artifact}.sol`,
                `${artifact}.json`
            );
            
            if (!fs.existsSync(artifactPath)) {
                throw new Error(`Artifact file not found: ${artifactPath}`);
            }

            const artifactData = require(artifactPath);
            if (!artifactData.abi) {
                throw new Error(`No ABI found in artifact: ${artifact}`);
            }

            const targetPath = path.join(contractsDir, `${artifact}.json`);
            fs.writeFileSync(
                targetPath,
                JSON.stringify({ abi: artifactData.abi }, null, 2)
            );
            console.log(`ABI written for ${artifact} (${artifactData.abi.length} entries)`);

            // Verify the written file
            const written = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
            if (!written.abi) {
                throw new Error(`Verification failed for ${artifact}`);
            }
        } catch (error) {
            console.error(`Error processing ABI for ${artifact}:`, error.message);
            process.exit(1); // Exit if ABI processing fails
        }
    }

    // Write config
    const config = {
        environment,
        network,
        ipfsGateway: "https://gateway.pinata.cloud/ipfs/",
        networkId: network === 'ganache' ? 1337 : 11155111,
        networkName: network === 'ganache' ? 'Ganache' : 'Sepolia',
        contracts: addresses,
        rpcUrl: network === 'ganache' 
            ? 'http://localhost:7545'
            : process.env.SEPOLIA_RPC_URL
    };

    fs.writeFileSync(
        path.join(configDir, "index.js"),
        `export default ${JSON.stringify(config, null, 2)};`
    );

    console.log('Frontend configuration written successfully');
}

main().catch((error) => {
    console.error('Error in prepare-frontend:', error);
    process.exit(1);
}); 