import { keccak256 } from "ethers";
import { GenomeInput } from "./alelleTypesV1";
import { encodeTrait, TRAIT_ORDER } from "./encodeAlleleV1";

export function packGenome(input: GenomeInput) {
  let genome = 0n;
  let bitCursor = 0n;

  // === 12 traits × 12 bits ===
  for (const trait of TRAIT_ORDER) {
    const traitBits = encodeTrait(trait, input[trait]);
    genome |= BigInt(traitBits) << bitCursor;
    bitCursor += 12n;
  }

  // === extra fields ===
  const writeBits = (value: number, bits: number) => {
    genome |= BigInt(value) << bitCursor;
    bitCursor += BigInt(bits);
  };

  writeBits(input.variegationLevel ?? 0, 4);
  writeBits(input.monstroseLevel ?? 0, 4);
  writeBits(input.cresting ? 1 : 0, 1);
  writeBits(input.dichotomous ? 1 : 0, 1);
  writeBits(input.mutationLuck ?? 0, 4);
  writeBits(input.speciesClass ?? 0, 8);
  writeBits(input.generation ?? 0, 8);
  writeBits(input.genomeVersion ?? 1, 8);

  // === hex ===
  const hex = "0x" + genome.toString(16).padStart(64, "0");

  // // === hash (optional) ===
  // const hash = keccak256(hex);

  return {
    genomeBigInt: genome,
    genomeHex: hex,
    // genomeHash: hash
  };
}