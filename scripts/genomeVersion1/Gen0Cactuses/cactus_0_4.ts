import { packGenome } from "../packAlleleToUintV1";

export const cactus_0_4 = packGenome({
  bodyShape: { dominant: "Tuberculate", recessive1: "Globular", recessive2: "Depressed" },
  ribCount: { dominant: "Low", recessive1: "VeryLow", recessive2: "Medium" },
  epidermisColor: { dominant: "PurpleTint", recessive1: "RedStressTint", recessive2: "DarkGreen" },
  spineLength: { dominant: "VeryLong", recessive1: "Long", recessive2: "Medium" },
  spineDensity: { dominant: "Sparse", recessive1: "Medium", recessive2: "Dense" },
  spineColor: { dominant: "DarkPurple", recessive1: "Black", recessive2: "Red" },
  areoleSize: { dominant: "Tiny", recessive1: "Small", recessive2: "Medium" },
  woolAmount: { dominant: "None", recessive1: "Low", recessive2: "Medium" },
  flowerColor: { dominant: "Red", recessive1: "Orange", recessive2: "Yellow" },
  growthSpeed: { dominant: "VerySlow", recessive1: "Slow", recessive2: "Medium" },
  rotResistance: { dominant: "Low", recessive1: "VeryLow", recessive2: "Medium" },
  offsetRate: { dominant: "None", recessive1: "Rare", recessive2: "Low" },
  variegationLevel: 0,
  monstroseLevel: 0,
  cresting: true,
  dichotomous: false,
  mutationLuck: 5,
  speciesClass: 5,
  generation: 0,
  genomeVersion: 1
});