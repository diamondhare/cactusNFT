import { packGenome } from "../packAlleleToUintV1";

export const cactus_0_5 = packGenome({
  bodyShape: { dominant: "Spiral", recessive1: "Columnar", recessive2: "CrestedTendency" },
  ribCount: { dominant: "Irregular", recessive1: "High", recessive2: "Medium" },
  epidermisColor: { dominant: "WhiteVariegated", recessive1: "YellowVariegated", recessive2: "BlueGreen" },
  spineLength: { dominant: "Extreme", recessive1: "VeryLong", recessive2: "Long" },
  spineDensity: { dominant: "WoolCovered", recessive1: "VeryDense", recessive2: "Dense" },
  spineColor: { dominant: "Golden", recessive1: "Yellow", recessive2: "White" },
  areoleSize: { dominant: "Huge", recessive1: "Large", recessive2: "Medium" },
  woolAmount: { dominant: "Extreme", recessive1: "High", recessive2: "Medium" },
  flowerColor: { dominant: "Multicolor", recessive1: "RareBiColor", recessive2: "Purple" },
  growthSpeed: { dominant: "VeryFast", recessive1: "Fast", recessive2: "Medium" },
  rotResistance: { dominant: "VeryHigh", recessive1: "High", recessive2: "Medium" },
  offsetRate: { dominant: "Aggressive", recessive1: "High", recessive2: "Medium" },
  variegationLevel: 3,
  monstroseLevel: 2,
  cresting: true,
  dichotomous: true,
  mutationLuck: 7,
  speciesClass: 6,
  generation: 0,
  genomeVersion: 1
});