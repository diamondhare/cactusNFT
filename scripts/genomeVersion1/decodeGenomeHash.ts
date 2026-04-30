import { TRAITS } from "./cactusTraitsV1";
import type { GenomeInput } from "./alelleTypesV1";

const TRAIT_ORDER = [
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
  "offsetRate"
] as const;

type TraitKey = typeof TRAIT_ORDER[number];
type DecodedGenome = Required<GenomeInput>;

function reverseMap(obj: Record<string, number>) {
  const res: Record<number, string> = {};
  for (const k in obj) res[obj[k]] = k;
  return res;
}

const REVERSE = Object.fromEntries(
  Object.entries(TRAITS).map(([k, v]) => [k, reverseMap(v)])
) as Record<TraitKey, Record<number, string>>;

function decodeTrait(trait: TraitKey, value: number) {
  return {
    dominant: REVERSE[trait][(value >> 8) & 0xf],
    recessive1: REVERSE[trait][(value >> 4) & 0xf],
    recessive2: REVERSE[trait][value & 0xf]
  };
}

export function decodeGenome(genome: bigint): DecodedGenome {
  let bitCursor = 0n;
  const result: Partial<DecodedGenome> = {};

  for (const trait of TRAIT_ORDER) {
    const raw = Number((genome >> bitCursor) & 0xfffn); // 12 bits
    result[trait] = decodeTrait(trait, raw);
    bitCursor += 12n;
  }

  const readBits = (bits: number) => {
    const val = Number((genome >> bitCursor) & ((1n << BigInt(bits)) - 1n));
    bitCursor += BigInt(bits);
    return val;
  };

  result.variegationLevel = readBits(4);
  result.monstroseLevel = readBits(4);
  result.cresting = readBits(1) === 1;
  result.dichotomous = readBits(1) === 1;
  result.mutationLuck = readBits(4);
  result.speciesClass = readBits(8);
  result.generation = readBits(8);
  result.genomeVersion = readBits(8);

  return result as DecodedGenome;
}
