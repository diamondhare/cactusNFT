import { expect } from "chai";
import { toBeHex } from "ethers";
import { breedCactusGenomeOffchain } from "../scripts/genetics/breed-cactus-offchain";
import { cactus_0_0 } from "../scripts/genomeVersion1/Gen0Cactuses/cactus_0_0";
import { cactus_0_1 } from "../scripts/genomeVersion1/Gen0Cactuses/cactus_0_1";
import { cactus_0_2 } from "../scripts/genomeVersion1/Gen0Cactuses/cactus_0_2";
import { cactus_0_3 } from "../scripts/genomeVersion1/Gen0Cactuses/cactus_0_3";
import { decodeGenome } from "../scripts/genomeVersion1/decodeGenomeHash";
import {
  deployCactusGameFixture,
  futureDeadline,
  signBreed,
  signGermination,
} from "./helpers/cactusGameFixture";
import type {
  CactusBreedingContract,
  CactusGerminationContract,
  Seed721Contract,
} from "../scripts/deploy/shared/cactusGameContractTypes";

describe("Cactus game e2e", function () {
  it("user grows transferred seed, selects open partner, and both receive child seeds", async function () {
    const {
      ethers,
      admin,
      player,
      bot,
      cactus,
      seeds,
      breeding,
      germination,
      breedingFee,
    } = await deployCactusGameFixture();

    await cactus.mintGen1Cactus(admin.address, cactus_0_0.genomeHex);
    await cactus.mintGen1Cactus(admin.address, cactus_0_1.genomeHex);

    const starterSeed = breedCactusGenomeOffchain({
      parentAGenome: cactus_0_0.genomeBigInt,
      parentBGenome: cactus_0_1.genomeBigInt,
      parentAGeneration: 1,
      parentBGeneration: 1,
      salt: "starter-seed:user-wallet-demo",
    });

    logGenomeBreeding("backend starter seed genetics", {
      parentA: {
        label: "parentA",
        tokenId: 0,
        owner: admin.address,
        genome: cactus_0_0.genomeBigInt,
        generation: 1,
      },
      parentB: {
        label: "parentB",
        tokenId: 1,
        owner: admin.address,
        genome: cactus_0_1.genomeBigInt,
        generation: 1,
      },
      child: {
        label: "child",
        genome: starterSeed.genomeBigInt,
        generation: starterSeed.generation,
      },
      entropy: starterSeed.entropy,
    });

    await seeds.mint(
      admin.address,
      starterSeed.genomeBigInt,
      0,
      1,
      starterSeed.generation,
      10_000
    );
    await seeds.transferFrom(admin.address, player.address, 0);
    expect(await seeds.ownerOf(0)).to.equal(player.address);

    await (seeds.connect(player) as unknown as Seed721Contract).approve(
      await germination.getAddress(),
      0
    );
    const starterDeadline = await futureDeadline(ethers);
    await expect(
      (germination.connect(
        player
      ) as unknown as CactusGerminationContract)
        .germinateWithSignature(
          0,
          starterDeadline,
          await signGermination(
            ethers,
            admin,
            germination,
            player.address,
            0,
            starterDeadline
          )
        )
    ).to.emit(germination, "Germinated");

    const playerCactusId = 2;
    expect(await cactus.ownerOf(playerCactusId)).to.equal(player.address);
    expect((await cactus.cactusData(playerCactusId)).generation).to.equal(2);
    expect((await cactus.cactusData(playerCactusId)).genome).to.equal(
      starterSeed.genomeBigInt
    );

    await cactus.mintGen1Cactus(bot.address, cactus_0_2.genomeHex);
    await cactus.mintGen1Cactus(admin.address, cactus_0_3.genomeHex);
    const botCactusId = 3;
    const adminListedCactusId = 4;

    await expect(
      (breeding.connect(bot) as unknown as CactusBreedingContract)
        .openForBreeding(botCactusId)
    )
      .to.emit(breeding, "CactusOpenedForBreeding")
      .withArgs(bot.address, botCactusId);
    await expect(breeding.openForBreeding(adminListedCactusId))
      .to.emit(breeding, "CactusOpenedForBreeding")
      .withArgs(admin.address, adminListedCactusId);

    const childSeed = breedCactusGenomeOffchain({
      parentAGenome: starterSeed.genomeBigInt,
      parentBGenome: cactus_0_2.genomeBigInt,
      parentAGeneration: 2,
      parentBGeneration: 1,
      salt: "marketplace-choice:user-selects-bot-cactus",
    });

    console.log(
      [
        "available breeding partners",
        formatGenomeCard({
          label: "selected partner",
          tokenId: botCactusId,
          owner: bot.address,
          genome: cactus_0_2.genomeBigInt,
          generation: 1,
        }),
        formatGenomeCard({
          label: "listed partner",
          tokenId: adminListedCactusId,
          owner: admin.address,
          genome: cactus_0_3.genomeBigInt,
          generation: 1,
        }),
      ].join("\n")
    );
    logGenomeBreeding("backend marketplace breeding genetics", {
      selectedBy: player.address,
      parentA: {
        label: "parentA",
        tokenId: playerCactusId,
        owner: player.address,
        genome: starterSeed.genomeBigInt,
        generation: 2,
      },
      parentB: {
        label: "parentB",
        tokenId: botCactusId,
        owner: bot.address,
        genome: cactus_0_2.genomeBigInt,
        generation: 1,
      },
      child: {
        label: "child",
        genome: childSeed.genomeBigInt,
        generation: childSeed.generation,
      },
      entropy: childSeed.entropy,
    });

    const breedDeadline = await futureDeadline(ethers);
    await expect(
      (breeding.connect(
        player
      ) as unknown as CactusBreedingContract)
        .breedWithSignature(
          playerCactusId,
          botCactusId,
          childSeed.genomeBigInt,
          breedDeadline,
          await signBreed(
            ethers,
            admin,
            breeding,
            player.address,
            playerCactusId,
            botCactusId,
            childSeed.genomeBigInt,
            breedDeadline
          ),
          { value: breedingFee }
        )
    )
      .to.emit(breeding, "Breeded")
      .withArgs(
        player.address,
        playerCactusId,
        botCactusId,
        1,
        2,
        3,
        childSeed.genomeBigInt,
        10_000,
        breedingFee
      );

    expect(await seeds.ownerOf(1)).to.equal(player.address);
    expect(await seeds.ownerOf(2)).to.equal(bot.address);
    expect((await seeds.seedData(1)).genome).to.equal(childSeed.genomeBigInt);
    expect((await seeds.seedData(1)).generation).to.equal(3);
    expect((await seeds.seedData(2)).genome).to.equal(childSeed.genomeBigInt);
    expect((await seeds.seedData(2)).generation).to.equal(3);

    await (seeds.connect(player) as unknown as Seed721Contract).approve(
      await germination.getAddress(),
      1
    );
    const childDeadline = await futureDeadline(ethers);
    await expect(
      (germination.connect(
        player
      ) as unknown as CactusGerminationContract)
        .germinateWithSignature(
          1,
          childDeadline,
          await signGermination(
            ethers,
            admin,
            germination,
            player.address,
            1,
            childDeadline
          )
        )
    ).to.emit(germination, "Germinated");

    const childCactusId = 5;
    expect(await cactus.ownerOf(childCactusId)).to.equal(player.address);
    expect((await cactus.cactusData(childCactusId)).genome).to.equal(
      childSeed.genomeBigInt
    );
    expect((await cactus.cactusData(childCactusId)).generation).to.equal(3);
    await expect(seeds.ownerOf(1)).to.be.revertedWithCustomError(
      seeds,
      "ERC721NonexistentToken"
    );
  });
});

type GenomeCard = {
  label: string;
  tokenId?: number;
  owner?: string;
  genome: bigint;
  generation: number;
};

const TRAIT_KEYS = [
  "bodyShape",
  "ribCount",
  "epidermisColor",
  "spineLength",
  "spineDensity",
  "spineColor",
  "areoleSize",
  "woolAmount",
  "flowerColor",
  "growthSpeed",
  "rotResistance",
  "offsetRate",
] as const;

function logGenomeBreeding(
  title: string,
  data: {
    selectedBy?: string;
    parentA: GenomeCard;
    parentB: GenomeCard;
    child: GenomeCard;
    entropy: string;
  }
) {
  console.log(
    [
      title,
      data.selectedBy === undefined ? undefined : `selectedBy=${data.selectedBy}`,
      formatGenomeCard(data.parentA),
      formatGenomeCard(data.parentB),
      formatGenomeCard(data.child),
      `entropy=${shortHex(data.entropy)}`,
    ]
      .filter((line): line is string => line !== undefined)
      .join("\n")
  );
}

function formatGenomeCard(card: GenomeCard): string {
  const decoded = decodeGenome(card.genome);
  const header = [
    `${card.label}${card.tokenId === undefined ? "" : `#${card.tokenId}`}`,
    `gen=${card.generation}`,
    card.owner === undefined ? undefined : `owner=${shortAddress(card.owner)}`,
    `genome=${shortHex(toBeHex(card.genome, 32))}`,
  ]
    .filter((part): part is string => part !== undefined)
    .join(" ");
  const traits = TRAIT_KEYS.map((trait) => {
    const value = decoded[trait];

    return `${trait}=${value.dominant}/${value.recessive1}/${value.recessive2}`;
  });
  const chunks = [traits.slice(0, 4), traits.slice(4, 8), traits.slice(8, 12)]
    .map((chunk) => `  ${chunk.join("; ")}`)
    .join("\n");
  const meta = `  meta=var${decoded.variegationLevel} mon${decoded.monstroseLevel} crest${Number(decoded.cresting)} dich${Number(decoded.dichotomous)} luck${decoded.mutationLuck} species${decoded.speciesClass} gv${decoded.genomeVersion}`;

  return `${header}\n${chunks}\n${meta}`;
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortHex(hex: string): string {
  return `${hex.slice(0, 10)}...${hex.slice(-8)}`;
}
