const hre = require("hardhat");

async function main() {
  // Deploy TravelNFT
  const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
  const travelNFT = await TravelNFT.deploy();
  await travelNFT.waitForDeployment();
  console.log("TravelNFT deployed to:", await travelNFT.getAddress());

  // Deploy TravelSBT
  const TravelSBT = await hre.ethers.getContractFactory("TravelSBT");
  const travelSBT = await TravelSBT.deploy();
  await travelSBT.waitForDeployment();
  console.log("TravelSBT deployed to:", await travelSBT.getAddress());

  // Deploy TravelToken
  const TravelToken = await hre.ethers.getContractFactory("TravelToken");
  const travelToken = await TravelToken.deploy();
  await travelToken.waitForDeployment();
  console.log("TravelToken deployed to:", await travelToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 