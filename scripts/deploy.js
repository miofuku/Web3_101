const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function updateEnvFile(contracts) {
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    for (const [name, address] of Object.entries(contracts)) {
        const varName = `TRAVEL_${name}_ADDRESS`;
        if (envContent.includes(varName)) {
            envContent = envContent.replace(
                new RegExp(`${varName}=.*`), 
                `${varName}=${address}`
            );
        } else {
            envContent += `\n${varName}=${address}`;
        }
    }

    fs.writeFileSync(envPath, envContent);
}

async function main() {
    // Deploy contracts
    const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
    const travelNFT = await TravelNFT.deploy();
    await travelNFT.waitForDeployment();

    const TravelSBT = await hre.ethers.getContractFactory("TravelSBT");
    const travelSBT = await TravelSBT.deploy();
    await travelSBT.waitForDeployment();

    const TravelToken = await hre.ethers.getContractFactory("TravelToken");
    const travelToken = await TravelToken.deploy();
    await travelToken.waitForDeployment();

    // Get addresses
    const contracts = {
        'NFT': await travelNFT.getAddress(),
        'TOKEN': await travelToken.getAddress(),
        'SBT': await travelSBT.getAddress()
    };

    // Update .env file
    await updateEnvFile(contracts);

    console.log("Contracts deployed to:");
    console.log("TravelNFT:", contracts.NFT);
    console.log("TravelToken:", contracts.TOKEN);
    console.log("TravelSBT:", contracts.SBT);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 