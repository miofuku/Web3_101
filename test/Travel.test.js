const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Travel Contracts", function () {
  let TravelNFT, travelNFT;
  let TravelSBT, travelSBT;
  let TravelToken, travelToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contracts
    TravelNFT = await ethers.getContractFactory("TravelNFT");
    travelNFT = await TravelNFT.deploy();

    TravelSBT = await ethers.getContractFactory("TravelSBT");
    travelSBT = await TravelSBT.deploy();

    TravelToken = await ethers.getContractFactory("TravelToken");
    travelToken = await TravelToken.deploy();
  });

  describe("TravelNFT", function () {
    it("Should mint a location NFT", async function () {
      const tx = await travelNFT.mintLocationNFT(
        addr1.address,
        "Eiffel Tower",
        "France",
        "48.8584° N, 2.2945° E",
        "ipfs://QmExample",
        0 // NFTType.COLLECTIBLE
      );

      expect(await travelNFT.ownerOf(1)).to.equal(addr1.address);
    });
  });

  describe("TravelSBT", function () {
    it("Should mint a milestone SBT", async function () {
      await travelSBT.mintMilestoneSBT(addr1.address, 1);
      expect(await travelSBT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should not allow SBT transfer", async function () {
      await travelSBT.mintMilestoneSBT(addr1.address, 1);
      await expect(
        travelSBT.connect(addr1).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWith("Token is Soulbound - no transfers");
    });
  });

  describe("TravelToken", function () {
    it("Should reward tokens for visit", async function () {
      const rewardAmount = ethers.parseEther("100");
      await travelToken.rewardForVisit(addr1.address, rewardAmount);
      expect(await travelToken.balanceOf(addr1.address)).to.equal(rewardAmount);
    });
  });
}); 