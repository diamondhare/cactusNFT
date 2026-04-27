import { TRAITS } from "./cactusTraitsV1.js";

export type TraitKey = keyof typeof TRAITS;

export type AlleleInput = {
  dominant: string;
  recessive1: string;
  recessive2: string;
};

export type GenomeInput = {
  [K in TraitKey]: AlleleInput;
} & {
  variegationLevel?: number;
  monstroseLevel?: number;
  cresting?: boolean;
  dichotomous?: boolean;
  mutationLuck?: number;
  speciesClass?: number;
  generation?: number;
  genomeVersion?: number;
};