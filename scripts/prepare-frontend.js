const fs = require('fs');
const path = require('path');
const { CONTRACT_ADDRESSES } = require('../utils/contracts');

async function main() {
    // Create contracts directory in frontend if it doesn't exist
    const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Write contract addresses
    fs.writeFileSync(
        path.join(contractsDir, "addresses.json"),
        JSON.stringify(CONTRACT_ADDRESSES, null, 2)
    );

    // Copy contract ABIs
    const artifacts = ["TravelNFT", "TravelToken", "TravelSBT"];
    artifacts.forEach(artifact => {
        const artifactPath = path.join(
            __dirname,
            "..",
            "artifacts",
            "contracts",
            `${artifact}.sol`,
            `${artifact}.json`
        );
        
        const artifactData = require(artifactPath);
        
        fs.writeFileSync(
            path.join(contractsDir, `${artifact}.json`),
            JSON.stringify(artifactData.abi, null, 2)
        );
    });

    console.log("Frontend files prepared!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 