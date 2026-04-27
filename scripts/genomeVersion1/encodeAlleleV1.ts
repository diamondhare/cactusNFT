import { keccak256 } from "ethers";
import { TRAITS } from "./cactusTraitsV1.js";
import { AlleleInput, TraitKey } from "./alelleTypesV1.js";

export const TRAIT_ORDER: TraitKey[] = [
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
];

function encodeAllele(
  trait: TraitKey,
  allele: string
): number {
  const map = TRAITS[trait];
  const value = map[allele as keyof typeof map];

  if (value === undefined) {
    throw new Error(`Invalid allele "${allele}" for trait "${trait}"`);
  }

  if (value > 15) {
    throw new Error(`Allele value overflow (>4 bits)`);
  }

  return value;
}

export function encodeTrait(
  trait: TraitKey,
  alleles: AlleleInput
): number {
  const d = encodeAllele(trait, alleles.dominant);
  const r1 = encodeAllele(trait, alleles.recessive1);
  const r2 = encodeAllele(trait, alleles.recessive2);

  return (d << 8) | (r1 << 4) | r2; // 12 bits
}