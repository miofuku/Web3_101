const hre = require("hardhat");
const { getContractAddress } = require('../utils/contracts');

async function main() {
  const [owner, traveler] = await hre.ethers.getSigners();

  // Get the deployed contracts using utils
  const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
  const TravelToken = await hre.ethers.getContractFactory("TravelToken");
  const TravelSBT = await hre.ethers.getContractFactory("TravelSBT");

  const travelNFT = TravelNFT.attach(getContractAddress('TravelNFT'));
  const travelToken = TravelToken.attach(getContractAddress('TravelToken'));
  const travelSBT = TravelSBT.attach(getContractAddress('TravelSBT'));

  // Rest of your interaction code
  const mintTx = await travelNFT.mintLocationNFT(
    traveler.address,
    "Mount Fuji",
    "Japan",
    "35.3606° N, 138.7278° E",
    "ipfs://QmExample",
    0
  );
  await mintTx.wait();
  console.log("Minted NFT for:", traveler.address);

  // Reward tokens for the visit
  const rewardAmount = hre.ethers.parseEther("100");
  const rewardTx = await travelToken.rewardForVisit(traveler.address, rewardAmount);
  await rewardTx.wait();
  console.log("Rewarded tokens:", hre.ethers.formatEther(rewardAmount));

  // Mint a milestone SBT
  const sbtTx = await travelSBT.mintMilestoneSBT(traveler.address, 1);
  await sbtTx.wait();
  console.log("Minted SBT for:", traveler.address);

  // Check balances
  const nftBalance = await travelNFT.balanceOf(traveler.address);
  const tokenBalance = await travelToken.balanceOf(traveler.address);
  const sbtBalance = await travelSBT.balanceOf(traveler.address);

  console.log("\nTraveler Balances:");
  console.log("NFTs:", nftBalance.toString());
  console.log("Tokens:", hre.ethers.formatEther(tokenBalance));
  console.log("SBTs:", sbtBalance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 