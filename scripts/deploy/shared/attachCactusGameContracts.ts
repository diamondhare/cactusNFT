import type { HardhatEthers } from "@nomicfoundation/hardhat-ethers/types";
import type {
  Cactus721Contract,
  CactusBreedingContract,
  CactusGerminationContract,
  MockVRFContract,
  Seed721Contract,
} from "./cactusGameContractTypes";
import type { CactusGameContracts } from "./deployCactusGameContracts";

export type CactusGameContractAddresses = {
  cactus: string;
  seeds: string;
  breeding: string;
  germination: string;
  vrf: string;
};

export async function attachCactusGameContracts(
  ethers: HardhatEthers,
  addresses: CactusGameContractAddresses
): Promise<CactusGameContracts> {
  const cactus = (await ethers.getContractAt(
    "Cactus721",
    addresses.cactus
  )) as unknown as Cactus721Contract;
  const seeds = (await ethers.getContractAt(
    "Seed721",
    addresses.seeds
  )) as unknown as Seed721Contract;
  const breeding = (await ethers.getContractAt(
    "CactusBreeding",
    addresses.breeding
  )) as unknown as CactusBreedingContract;
  const germination = (await ethers.getContractAt(
    "CactusGermination",
    addresses.germination
  )) as unknown as CactusGerminationContract;
  const vrf = (await ethers.getContractAt(
    "MockVRF",
    addresses.vrf
  )) as MockVRFContract;

  return {
    cactus,
    seeds,
    breeding,
    germination,
    vrf,
  };
}
