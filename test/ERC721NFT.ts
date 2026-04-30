import { expect } from "chai";
import { network } from "hardhat";
import { cactus_0_0 } from "../scripts/genomeVersion1/Gen0Cactuses/cactus_0_0";
import type { HardhatEthers } from "@nomicfoundation/hardhat-ethers/types";
import type { CactusCore } from "../types/ethers-contracts/index.js";

describe("CactusCore", function () {
  let cactusCore: CactusCore;
  let ethers: HardhatEthers;

  before(async function () {
    const connection = await network.connect();
    ethers = connection.ethers;

    const CactusCore = await ethers.getContractFactory("CactusCore");
    cactusCore = await CactusCore.deploy("Cacti", "CACTI", "https://example.com/");
    await cactusCore.waitForDeployment();
  });

  it("Should mint mother cactus to admin", async function () {
    const [admin] = await ethers.getSigners();

    await expect(
      cactusCore.mintMotherCactus(admin.address, 0)
    )
      .to.emit(cactusCore, "MotherCactusMinted")
      .withArgs(admin.address);

    const data = await cactusCore.cactusData(0);

    expect(data.genomeData).to.equal(0);
    expect(await cactusCore.balanceOf(admin.address)).to.equal(1);
  });

  it("Should not allow minting twice", async function () {
    const [admin] = await ethers.getSigners();

    await expect(
      cactusCore.mintMotherCactus(admin.address, 0)
    ).to.be.revertedWithCustomError(
      cactusCore,
      "MotherCactusAlreadyMinted"
    );
  });

  it("Should mint gen0 cactus", async function () {
    const [admin] = await ethers.getSigners();

    const genome = cactus_0_0.genomeHex;

    await expect(
      cactusCore.mintGen1Cactus(admin.address, genome)
    )
      .to.emit(cactusCore, "Gen1CactusMinted")
      .withArgs(1,admin.address, 1n, genome);

    const data = await cactusCore.cactusData(1);

    expect(data.genomeData).to.equal(genome);
  });
});
