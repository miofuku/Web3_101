const hre = require("hardhat");

async function main() {
  const [owner, traveler] = await hre.ethers.getSigners();

  // Get the deployed contracts by their addresses
  const TravelNFT = await hre.ethers.getContractFactory("TravelNFT");
  const TravelToken = await hre.ethers.getContractFactory("TravelToken");
  const TravelSBT = await hre.ethers.getContractFactory("TravelSBT");

  // Replace these with your actual deployed contract addresses
  const travelNFT = TravelNFT.attach("0x3653Cdfd41DC5fA028cEB2BA4A1E6A95258fCfd8");
  const travelToken = TravelToken.attach("0x9fB5Ee23B6924ea79f30C33a6778Ce14c9f5D7cB");
  const travelSBT = TravelSBT.attach("0x602B057182294328DB387300CD13d0751EA9C991");

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