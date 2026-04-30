import { AbiCoder, keccak256, toBeHex } from "ethers";
import { pathToFileURL } from "node:url";
import { cactus_0_0 } from "../genomeVersion1/Gen0Cactuses/cactus_0_0";
import { cactus_0_1 } from "../genomeVersion1/Gen0Cactuses/cactus_0_1";
import type { AlleleInput, GenomeInput, TraitKey } from "../genomeVersion1/alelleTypesV1";
import { decodeGenome } from "../genomeVersion1/decodeGenomeHash";
import { TRAIT_ORDER } from "../genomeVersion1/encodeAlleleV1";
import { packGenome } from "../genomeVersion1/packAlleleToUintV1";

export type BreedGenomeInput = {
  parentAGenome: bigint;
  parentBGenome: bigint;
  parentAGeneration: number;
  parentBGeneration: number;
  salt: string;
};

export type BreedGenomeResult = {
  genomeBigInt: bigint;
  genomeHex: string;
  generation: number;
  entropy: string;
  mutationApplied: false;
};

const abiCoder = AbiCoder.defaultAbiCoder();

export function breedCactusGenomeOffchain(
  input: BreedGenomeInput
): BreedGenomeResult {
  const entropy = keccak256(
    abiCoder.encode(
      ["uint256", "uint256", "uint32", "uint32", "string"],
      [
        input.parentAGenome,
        input.parentBGenome,
        input.parentAGeneration,
        input.parentBGeneration,
        input.salt,
      ]
    )
  );
  const parentA = decodeGenome(input.parentAGenome);
  const parentB = decodeGenome(input.parentBGenome);
  const generation =
    Math.max(input.parentAGeneration, input.parentBGeneration) + 1;
  const child: GenomeInput = {} as GenomeInput;

  for (const trait of TRAIT_ORDER) {
    child[trait] = inheritTrait(
      trait,
      parentA[trait],
      parentB[trait],
      entropy
    );
  }

  child.variegationLevel = inheritNumber(
    parentA.variegationLevel,
    parentB.variegationLevel,
    entropy,
    "variegationLevel"
  );
  child.monstroseLevel = inheritNumber(
    parentA.monstroseLevel,
    parentB.monstroseLevel,
    entropy,
    "monstroseLevel"
  );
  child.cresting = inheritBoolean(
    parentA.cresting,
    parentB.cresting,
    entropy,
    "cresting"
  );
  child.dichotomous = inheritBoolean(
    parentA.dichotomous,
    parentB.dichotomous,
    entropy,
    "dichotomous"
  );
  child.mutationLuck = inheritNumber(
    parentA.mutationLuck,
    parentB.mutationLuck,
    entropy,
    "mutationLuck"
  );
  child.speciesClass = chooseOne(
    parentA.speciesClass,
    parentB.speciesClass,
    entropy,
    "speciesClass"
  );
  child.generation = generation;
  child.genomeVersion = Math.max(parentA.genomeVersion, parentB.genomeVersion);

  const packed = packGenome(child);

  return {
    genomeBigInt: packed.genomeBigInt,
    genomeHex: packed.genomeHex,
    generation,
    entropy,
    mutationApplied: false,
  };
}

function inheritTrait(
  trait: TraitKey,
  parentA: AlleleInput,
  parentB: AlleleInput,
  entropy: string
): AlleleInput {
  const alleleFromA = chooseParentAllele(parentA, entropy, `${trait}:gamete:a`);
  const alleleFromB = chooseParentAllele(parentB, entropy, `${trait}:gamete:b`);
  const dominantComesFromA =
    randomInt(entropy, `${trait}:dominance`, 10_000) < 5_000;
  const dominant = dominantComesFromA ? alleleFromA : alleleFromB;
  const recessive1 = dominantComesFromA ? alleleFromB : alleleFromA;
  const recessive2 = chooseOne(
    chooseParentAllele(parentA, entropy, `${trait}:reserve:a`),
    chooseParentAllele(parentB, entropy, `${trait}:reserve:b`),
    entropy,
    `${trait}:reserve`
  );

  return {
    dominant,
    recessive1,
    recessive2,
  };
}

function chooseParentAllele(
  alleles: AlleleInput,
  entropy: string,
  nonce: string
): string {
  const roll = randomInt(entropy, nonce, 10_000);

  if (roll < 5_000) return alleles.dominant;
  if (roll < 8_000) return alleles.recessive1;
  return alleles.recessive2;
}

function inheritNumber(
  parentA: number,
  parentB: number,
  entropy: string,
  nonce: string
): number {
  const min = Math.min(parentA, parentB);
  const max = Math.max(parentA, parentB);
  if (min === max) return min;

  return min + randomInt(entropy, nonce, max - min + 1);
}

function inheritBoolean(
  parentA: boolean,
  parentB: boolean,
  entropy: string,
  nonce: string
): boolean {
  if (parentA === parentB) return parentA;

  return randomInt(entropy, nonce, 10_000) < 5_000;
}

function chooseOne<T>(parentA: T, parentB: T, entropy: string, nonce: string): T {
  return randomInt(entropy, nonce, 2) === 0 ? parentA : parentB;
}

function randomInt(entropy: string, nonce: string, modulo: number): number {
  const value = BigInt(
    keccak256(abiCoder.encode(["bytes32", "string"], [entropy, nonce]))
  );

  return Number(value % BigInt(modulo));
}

function parseArgs(argv: string[]): BreedGenomeInput {
  const args = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (key?.startsWith("--") && value !== undefined) {
      args.set(key.slice(2), value);
    }
  }

  return {
    parentAGenome: BigInt(args.get("parent-a-genome") ?? cactus_0_0.genomeHex),
    parentBGenome: BigInt(args.get("parent-b-genome") ?? cactus_0_1.genomeHex),
    parentAGeneration: Number(args.get("parent-a-generation") ?? 1),
    parentBGeneration: Number(args.get("parent-b-generation") ?? 1),
    salt: args.get("salt") ?? "local-dev-seed",
  };
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const input = parseArgs(process.argv.slice(2));
  const result = breedCactusGenomeOffchain(input);

  console.log(
    JSON.stringify(
      {
        parentAGenome: toBeHex(input.parentAGenome, 32),
        parentBGenome: toBeHex(input.parentBGenome, 32),
        childGenome: result.genomeHex,
        generation: result.generation,
        entropy: result.entropy,
        mutationApplied: result.mutationApplied,
      },
      null,
      2
    )
  );
}
