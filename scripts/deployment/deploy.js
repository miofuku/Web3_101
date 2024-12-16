require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function updateEnvFile(contracts) {
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';

    // Read existing content if file exists
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add each contract address
    Object.entries(contracts).forEach(([name, address]) => {
        const varName = `TRAVEL_${name}_ADDRESS`;
        if (envContent.includes(varName)) {
            envContent = envContent.replace(
                new RegExp(`${varName}=.*`), 
                `${varName}=${address}`
            );
        } else {
            envContent += `\n${varName}=${address}`;
        }
    });

    // Write back to .env
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('Updated .env file with new contract addresses');
}

async function main() {
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

    console.log("Contracts deployed to:");
    console.log("TravelNFT:", contracts.NFT);
    console.log("TravelToken:", contracts.TOKEN);
    console.log("TravelSBT:", contracts.SBT);

    // Update .env file
    await updateEnvFile(contracts);

    // Run prepare-frontend script
    console.log("\nPreparing frontend files...");
    return new Promise((resolve, reject) => {
        // Give the file system a moment to finish writing the .env file
        setTimeout(() => {
            exec('npx hardhat run scripts/utils/prepare-frontend.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error preparing frontend: ${error}`);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.error(`Frontend preparation stderr: ${stderr}`);
                }
                console.log(stdout);
                resolve();
            });
        }, 1000); // Wait 1 second before running prepare-frontend
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 