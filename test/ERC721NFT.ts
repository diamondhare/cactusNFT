import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("CactusCore", function () {
  before(async function () {
    // Deploy the contract before running tests
    this.cactusCore = await ethers.deployContract("CactusCore", ["Cacti", "CACTI", "https://example.com/"]);
  });
  it("Should mint mother cactus to admin", async function () {
    const [admin] = await ethers.getSigners();
    const zeroBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
    await expect(this.cactusCore.mintMotherCactus(admin.address, zeroBytes32)).to.emit(this.cactusCore, "MotherCactusMinted").withArgs(admin.address);
    const motherCactusData = await this.cactusCore.cactusData(0);
    expect(motherCactusData.genomeHash).to.equal(zeroBytes32);
    expect(await this.cactusCore.balanceOf(admin.address)).to.equal(1);
  });

  it("Should not allow minting mother cactus more than once", async function () {
    const [admin] = await ethers.getSigners();
    const zeroBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
    await expect(this.cactusCore.mintMotherCactus(admin.address, zeroBytes32)).to.be.revertedWithCustomError(this.cactusCore, "MotherCactusAlreadyMinted");
  });

  it("Should not allow non-admin to mint mother cactus", async function () {
    const [, nonAdmin] = await ethers.getSigners();
    const zeroBytes32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
    await expect(this.cactusCore.connect(nonAdmin).mintMotherCactus(nonAdmin.address, zeroBytes32)).to.be.revertedWith("Ownable: caller is not the owner");
  }); 

  it("Should mint gen 0 cactus with correct genome hash", async function () {
    const [admin] = await ethers.getSigners();
    const genomeHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    await expect(this.cactusCore.mintGen0Cactus(admin.address, genomeHash)).to.emit(this.cactusCore, "Gen0CactusMinted").withArgs(admin.address, 1n);
    const gen0CactusData = await this.cactusCore.cactusData(1);
    expect(gen0CactusData.genomeHash).to.equal(genomeHash);
    expect(await this.cactusCore.balanceOf(admin.address)).to.equal(2);
  });
  // it("Should emit the Transfer event when calling the mint() function", async function () {
  //   const cactusCore = await ethers.deployContract("CactusCore", ["Cacti", "CACTI", "https://example.com/"]);

  //   const [owner] = await ethers.getSigners();
  //   await expect(cactusCore.mint(owner.address)).to.emit(cactusCore, "Transfer").withArgs(ethers.ZeroAddress, owner.address, 0n);
  // });

  // it("Should mint tokens with incrementing IDs and match total supply", async function () {
  //   const cactusCore = await ethers.deployContract("CactusCore", ["CactusCore", "GNFT", "https://example.com/"]);
  //   const [owner] = await ethers.getSigners();
  //   const deploymentBlockNumber = await ethers.provider.getBlockNumber();

  //   // Mint 10 tokens
  //   for (let i = 0; i < 10; i++) {
  //     await cactusCore.mint(owner.address);
  //   }

  //   const events = await cactusCore.queryFilter(
  //     cactusCore.filters.Transfer(ethers.ZeroAddress, owner.address),
  //     deploymentBlockNumber,
  //     "latest",
  //   );

  //   // Check that the number of events matches the minted tokens
  //   expect(events.length).to.equal(10);

  //   // Check token ownership
  //   for (let i = 0; i < 10; i++) {
  //     expect(await cactusCore.ownerOf(i)).to.equal(owner.address);
  //   }
  // });

  // it("Should respect pausing", async function () {
  //   const cactusCore = await ethers.deployContract("CactusCore", ["CactusCore", "GNFT", "https://example.com/"]);
  //   const [owner, other] = await ethers.getSigners();

  //   // Mint before pause
  //   await cactusCore.mint(owner.address);

  //   // Pause
  //   await cactusCore.pause();

  //   // Try to mint while paused - should revert
  //   await expect(cactusCore.mint(other.address)).to.be.revertedWithCustomError(cactusCore, "EnforcedPause");

  //   // Unpause
  //   await cactusCore.unpause();

  //   // Mint after unpause
  //   await cactusCore.mint(other.address);
  //   expect(await cactusCore.ownerOf(1)).to.equal(other.address);
  // });
});