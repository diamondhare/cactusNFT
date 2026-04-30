import { packGenome } from "../packAlleleToUintV1";

export const cactus_0_2 = packGenome({
  bodyShape: { dominant: "Barrel", recessive1: "Globular", recessive2: "Clumping" },
  ribCount: { dominant: "VeryHigh", recessive1: "High", recessive2: "Medium" },
  epidermisColor: { dominant: "BlueGreen", recessive1: "GreyGreen", recessive2: "Olive" },
  spineLength: { dominant: "Long", recessive1: "Medium", recessive2: "Short" },
  spineDensity: { dominant: "Dense", recessive1: "Medium", recessive2: "Sparse" },
  spineColor: { dominant: "Brown", recessive1: "Black", recessive2: "Red" },
  areoleSize: { dominant: "Medium", recessive1: "Small", recessive2: "Large" },
  woolAmount: { dominant: "Low", recessive1: "None", recessive2: "Medium" },
  flowerColor: { dominant: "Yellow", recessive1: "White", recessive2: "Orange" },
  growthSpeed: { dominant: "Slow", recessive1: "VerySlow", recessive2: "Medium" },
  rotResistance: { dominant: "High", recessive1: "Medium", recessive2: "Low" },
  offsetRate: { dominant: "Low", recessive1: "Rare", recessive2: "Medium" },
  variegationLevel: 1,
  monstroseLevel: 0,
  cresting: false,
  dichotomous: false,
  mutationLuck: 2,
  speciesClass: 3,
  generation: 0,
  genomeVersion: 1
});