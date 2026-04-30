import { expect } from "chai";
import {
  deployCactusGameFixture,
  futureDeadline,
  signBreed,
  signGermination,
} from "./helpers/cactusGameFixture";
import type {
  Cactus721Contract,
  CactusBreedingContract,
  CactusGerminationContract,
  Seed721Contract,
} from "../scripts/deploy/shared/cactusGameContractTypes";

describe("Cactus contracts", function () {
  it("mints origin and gen1 cacti only by admin", async function () {
    const { cactus, player } = await deployCactusGameFixture();

    await expect(
      (cactus.connect(player) as unknown as Cactus721Contract).mintOriginCactus(
        player.address,
        0x1111
      )
    ).to.be.revertedWithCustomError(cactus, "AccessControlUnauthorizedAccount");

    await expect(cactus.mintOriginCactus(player.address, 0x2222))
      .to.emit(cactus, "OriginCactusMinted")
      .withArgs(0, player.address, 0x2222);
    await expect(cactus.mintGen1Cactus(player.address, 0x3333))
      .to.emit(cactus, "Gen1CactusMinted")
      .withArgs(1, player.address, 0x3333);

    expect((await cactus.cactusData(0)).generation).to.equal(0);
    expect((await cactus.cactusData(1)).generation).to.equal(1);
  });

  it("creates two NFT seeds from backend-signed off-chain child genome", async function () {
    const {
      ethers,
      admin,
      cactus,
      seeds,
      breeding,
      player,
      feeRecipient,
      breedingFee,
    } = await deployCactusGameFixture();
    const childGenome = 0xaaaa;
    const deadline = await futureDeadline(ethers);

    await cactus.mintGen1Cactus(player.address, 0x1111);
    await cactus.mintGen1Cactus(player.address, 0x2222);
    await expect(
      (breeding.connect(player) as unknown as CactusBreedingContract)
        .openForBreeding(1)
    )
      .to.emit(breeding, "CactusOpenedForBreeding")
      .withArgs(player.address, 1);
    expect(await breeding.isOpenForBreeding(1)).to.equal(true);

    const breedTx = (breeding.connect(
      player
    ) as unknown as CactusBreedingContract)
      .breedWithSignature(
        0,
        1,
        childGenome,
        deadline,
        await signBreed(
          ethers,
          admin,
          breeding,
          player.address,
          0,
          1,
          childGenome,
          deadline
        ),
        { value: breedingFee }
      );

    await expect(breedTx)
      .to.emit(seeds, "SeedMinted")
      .withArgs(0, player.address, 0, 1, 2, childGenome, 10_000);
    await expect(breedTx)
      .to.emit(seeds, "SeedMinted")
      .withArgs(1, player.address, 0, 1, 2, childGenome, 10_000);
    await expect(breedTx).to.changeEtherBalance(
      ethers,
      feeRecipient,
      breedingFee
    );

    const seed = await seeds.seedData(0);
    expect(await seeds.ownerOf(0)).to.equal(player.address);
    expect(await seeds.ownerOf(1)).to.equal(player.address);
    expect(seed.genome).to.equal(childGenome);
    expect(seed.parentA).to.equal(0);
    expect(seed.parentB).to.equal(1);
    expect(seed.generation).to.equal(2);
  });

  it("burns seed and mints cactus when germination succeeds", async function () {
    const {
      ethers,
      admin,
      cactus,
      seeds,
      breeding,
      germination,
      player,
      breedingFee,
    } = await deployCactusGameFixture();
    const childGenome = 0xbeef;
    const breedDeadline = await futureDeadline(ethers);

    await cactus.mintGen1Cactus(player.address, 0x1111);
    await cactus.mintGen1Cactus(player.address, 0x2222);
    await (cactus.connect(player) as unknown as Cactus721Contract).setApprovalForAll(
      await breeding.getAddress(),
      true
    );
    await (breeding.connect(
      player
    ) as unknown as CactusBreedingContract)
      .breedWithSignature(
        0,
        1,
        childGenome,
        breedDeadline,
        await signBreed(
          ethers,
          admin,
          breeding,
          player.address,
          0,
          1,
          childGenome,
          breedDeadline
        ),
        { value: breedingFee }
      );
    await (seeds.connect(player) as unknown as Seed721Contract).approve(
      await germination.getAddress(),
      0
    );
    const germinationDeadline = await futureDeadline(ethers);

    await expect(
      (germination.connect(
        player
      ) as unknown as CactusGerminationContract)
        .germinateWithSignature(
          0,
          germinationDeadline,
          await signGermination(
            ethers,
            admin,
            germination,
            player.address,
            0,
            germinationDeadline
          )
        )
    ).to.emit(germination, "Germinated");

    await expect(seeds.ownerOf(0)).to.be.revertedWithCustomError(
      seeds,
      "ERC721NonexistentToken"
    );
    expect(await cactus.ownerOf(2)).to.equal(player.address);
    expect((await cactus.cactusData(2)).genome).to.equal(childGenome);
  });

  it("burns seed without minting cactus when germination fails", async function () {
    const {
      ethers,
      admin,
      cactus,
      seeds,
      breeding,
      germination,
      player,
      breedingFee,
    } = await deployCactusGameFixture();
    const breedDeadline = await futureDeadline(ethers);

    await breeding.setGerminationChanceBps(0);
    await cactus.mintGen1Cactus(player.address, 0x1111);
    await cactus.mintGen1Cactus(player.address, 0x2222);
    await (cactus.connect(player) as unknown as Cactus721Contract).setApprovalForAll(
      await breeding.getAddress(),
      true
    );
    await (breeding.connect(
      player
    ) as unknown as CactusBreedingContract)
      .breedWithSignature(
        0,
        1,
        0xbeef,
        breedDeadline,
        await signBreed(
          ethers,
          admin,
          breeding,
          player.address,
          0,
          1,
          0xbeef,
          breedDeadline
        ),
        { value: breedingFee }
      );
    await (seeds.connect(player) as unknown as Seed721Contract).approve(
      await germination.getAddress(),
      0
    );
    const germinationDeadline = await futureDeadline(ethers);

    await expect(
      (germination.connect(
        player
      ) as unknown as CactusGerminationContract)
        .germinateWithSignature(
          0,
          germinationDeadline,
          await signGermination(
            ethers,
            admin,
            germination,
            player.address,
            0,
            germinationDeadline
          )
        )
    ).to.emit(germination, "GerminationFailed");

    await expect(seeds.ownerOf(0)).to.be.revertedWithCustomError(
      seeds,
      "ERC721NonexistentToken"
    );
    await expect(cactus.ownerOf(2)).to.be.revertedWithCustomError(
      cactus,
      "ERC721NonexistentToken"
    );
  });
});
