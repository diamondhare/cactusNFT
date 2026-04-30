import { packGenome } from "../packAlleleToUintV1";

export const cactus_0_1 = packGenome({
  bodyShape: { dominant: "Columnar", recessive1: "Globular", recessive2: "Barrel" },
  ribCount: { dominant: "High", recessive1: "Medium", recessive2: "Low" },
  epidermisColor: { dominant: "DarkGreen", recessive1: "BlueGreen", recessive2: "GreyGreen" },
  spineLength: { dominant: "Medium", recessive1: "Short", recessive2: "VeryShort" },
  spineDensity: { dominant: "Medium", recessive1: "Sparse", recessive2: "Dense" },
  spineColor: { dominant: "White", recessive1: "Cream", recessive2: "Yellow" },
  areoleSize: { dominant: "Small", recessive1: "Tiny", recessive2: "Medium" },
  woolAmount: { dominant: "None", recessive1: "Low", recessive2: "Medium" },
  flowerColor: { dominant: "White", recessive1: "Pink", recessive2: "Yellow" },
  growthSpeed: { dominant: "Medium", recessive1: "Slow", recessive2: "Fast" },
  rotResistance: { dominant: "Medium", recessive1: "Low", recessive2: "High" },
  offsetRate: { dominant: "Rare", recessive1: "None", recessive2: "Low" },
  variegationLevel: 0,
  monstroseLevel: 0,
  cresting: false,
  dichotomous: false,
  mutationLuck: 1,
  speciesClass: 2,
  generation: 0,
  genomeVersion: 1
});