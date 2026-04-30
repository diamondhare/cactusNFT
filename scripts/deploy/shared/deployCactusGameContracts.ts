import type { HardhatEthers } from "@nomicfoundation/hardhat-ethers/types";
import type {
  Cactus721Contract,
  CactusBreedingContract,
  CactusGerminationContract,
  MockVRFContract,
  Seed721Contract,
} from "./cactusGameContractTypes";
import type { CactusGameDeploymentConfig } from "./cactusGameConfig";

export type CactusGameContracts = {
  cactus: Cactus721Contract;
  seeds: Seed721Contract;
  breeding: CactusBreedingContract;
  germination: CactusGerminationContract;
  vrf: MockVRFContract;
};

export async function deployCactusGameContracts(
  ethers: HardhatEthers,
  config: CactusGameDeploymentConfig,
  feeRecipient: string
): Promise<CactusGameContracts> {
  const Cactus721 = await ethers.getContractFactory("Cactus721");
  const Seed721 = await ethers.getContractFactory("Seed721");
  const CactusBreeding = await ethers.getContractFactory(
    "CactusBreeding" as string
  );
  const CactusGermination = await ethers.getContractFactory(
    "CactusGermination"
  );
  const MockVRF = await ethers.getContractFactory("MockVRF");

  const cactus = (await Cactus721.deploy(
    config.cactusName,
    config.cactusSymbol,
    config.cactusBaseUri
  )) as unknown as Cactus721Contract;
  await cactus.waitForDeployment();

  const seeds = (await Seed721.deploy(
    config.seedName,
    config.seedSymbol,
    config.seedBaseUri
  )) as Seed721Contract;
  await seeds.waitForDeployment();

  const vrf = (await MockVRF.deploy()) as MockVRFContract;
  await vrf.waitForDeployment();

  const breeding = (await CactusBreeding.deploy(
    await cactus.getAddress(),
    await seeds.getAddress(),
    config.breedingFee,
    feeRecipient
  )) as CactusBreedingContract;
  await breeding.waitForDeployment();

  const germination = (await CactusGermination.deploy(
    await cactus.getAddress(),
    await seeds.getAddress(),
    await vrf.getAddress()
  )) as CactusGerminationContract;
  await germination.waitForDeployment();

  return {
    cactus,
    seeds,
    breeding,
    germination,
    vrf,
  };
}
