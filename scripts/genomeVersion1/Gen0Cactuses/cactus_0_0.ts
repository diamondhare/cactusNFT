import { packGenome } from "../packAlleleToUintV1";

export const cactus_0_0 = packGenome({
  bodyShape: {
    dominant: "Globular",
    recessive1: "Columnar",
    recessive2: "Barrel"
  },

  ribCount: {
    dominant: "Medium",
    recessive1: "High",
    recessive2: "Low"
  },

  epidermisColor: {
    dominant: "BlueGreen",
    recessive1: "DarkGreen",
    recessive2: "Grey"
  },

  spineLength: {
    dominant: "Long",
    recessive1: "Medium",
    recessive2: "Short"
  },

  spineDensity: {
    dominant: "Dense",
    recessive1: "Medium",
    recessive2: "Sparse"
  },

  spineColor: {
    dominant: "Black",
    recessive1: "Brown",
    recessive2: "White"
  },

  areoleSize: {
    dominant: "Medium",
    recessive1: "Small",
    recessive2: "Large"
  },

  woolAmount: {
    dominant: "Low",
    recessive1: "None",
    recessive2: "High"
  },

  flowerColor: {
    dominant: "Pink",
    recessive1: "White",
    recessive2: "Yellow"
  },

  growthSpeed: {
    dominant: "Fast",
    recessive1: "Medium",
    recessive2: "Slow"
  },

  rotResistance: {
    dominant: "High",
    recessive1: "Medium",
    recessive2: "Low"
  },

  offsetRate: {
    dominant: "Low",
    recessive1: "None",
    recessive2: "High"
  },

  variegationLevel: 2,
  monstroseLevel: 0,
  cresting: false,
  dichotomous: false,
  mutationLuck: 3,
  speciesClass: 1,
  generation: 1,
  genomeVersion: 1
});