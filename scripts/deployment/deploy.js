require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function updateEnvFile(contracts, network) {
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update contract addresses with network prefix
    Object.entries(contracts).forEach(([name, address]) => {
        const varName = `${network.toUpperCase()}_TRAVEL_${name}_ADDRESS`;
        if (envContent.includes(varName)) {
            envContent = envContent.replace(
                new RegExp(`${varName}=.*`), 
                `${varName}=${address}`
            );
        } else {
            envContent += `\n${varName}=${address}`;
        }
    });

    // Update current network
    if (envContent.includes('DEPLOY_NETWORK=')) {
        envContent = envContent.replace(
            /DEPLOY_NETWORK=.*/,
            `DEPLOY_NETWORK=${network}`
        );
    } else {
        envContent += `\nDEPLOY_NETWORK=${network}`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log(`Updated .env file with new contract addresses for ${network}`);
}

async function main() {
    const network = process.env.HARDHAT_NETWORK || 'ganache';
    console.log(`Deploying to ${network}...`);

    // Get the deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // Deploy contracts
    const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
    const travelNFT = await TravelNFT.deploy();
    await travelNFT.waitForDeployment();

    const TravelToken = await hre.ethers.getContractFactory("TravelToken");
    const travelToken = await TravelToken.deploy();
    await travelToken.waitForDeployment();

    const TravelSBT = await hre.ethers.getContractFactory("TravelSBT");
    const travelSBT = await TravelSBT.deploy();
    await travelSBT.waitForDeployment();

    // Get addresses
    const contracts = {
        'NFT': await travelNFT.getAddress(),
        'TOKEN': await travelToken.getAddress(),
        'SBT': await travelSBT.getAddress()
    };

    console.log(`Contracts deployed to ${network}:`);
    console.log("TravelNFT:", contracts.NFT);
    console.log("TravelToken:", contracts.TOKEN);
    console.log("TravelSBT:", contracts.SBT);

    // Update .env file
    await updateEnvFile(contracts, network);

    // Run prepare-frontend script
    console.log("\nPreparing frontend files...");
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            exec('npx hardhat run scripts/utils/prepare-frontend.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error preparing frontend: ${error}`);
                    reject(error);
                    return;
                }
                console.log(stdout);
                resolve();
            });
        }, 1000);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 