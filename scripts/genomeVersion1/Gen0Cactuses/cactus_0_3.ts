import { packGenome } from "../packAlleleToUintV1";

export const cactus_0_3 = packGenome({
  bodyShape: { dominant: "Clumping", recessive1: "Globular", recessive2: "Segmented" },
  ribCount: { dominant: "Medium", recessive1: "Low", recessive2: "High" },
  epidermisColor: { dominant: "Olive", recessive1: "DarkGreen", recessive2: "GreyGreen" },
  spineLength: { dominant: "Short", recessive1: "VeryShort", recessive2: "Medium" },
  spineDensity: { dominant: "VeryDense", recessive1: "Dense", recessive2: "Medium" },
  spineColor: { dominant: "Golden", recessive1: "Yellow", recessive2: "Cream" },
  areoleSize: { dominant: "Large", recessive1: "Medium", recessive2: "Small" },
  woolAmount: { dominant: "Medium", recessive1: "Low", recessive2: "High" },
  flowerColor: { dominant: "Pink", recessive1: "Purple", recessive2: "White" },
  growthSpeed: { dominant: "Fast", recessive1: "Medium", recessive2: "Slow" },
  rotResistance: { dominant: "Medium", recessive1: "High", recessive2: "Low" },
  offsetRate: { dominant: "High", recessive1: "Medium", recessive2: "Low" },
  variegationLevel: 0,
  monstroseLevel: 1,
  cresting: false,
  dichotomous: false,
  mutationLuck: 4,
  speciesClass: 4,
  generation: 0,
  genomeVersion: 1
});