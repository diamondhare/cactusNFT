import { network } from "hardhat";
import { attachCactusGameContracts } from "../shared/attachCactusGameContracts";
import { configureCactusGameContracts } from "../shared/configureCactusGameContracts";

const connection = await network.connect({
  network: "hardhatMainnet",
  chainType: "l1",
});
const { ethers } = connection;

async function main() {
  const contracts = await attachCactusGameContracts(ethers, {
    cactus: readAddress("CACTUS_721_ADDRESS"),
    seeds: readAddress("SEED_721_ADDRESS"),
    breeding: readAddress("CACTUS_BREEDING_ADDRESS"),
    germination: readAddress("CACTUS_GERMINATION_ADDRESS"),
    vrf: readAddress("MOCK_VRF_ADDRESS"),
  });

  const roles = await configureCactusGameContracts(contracts);

  console.log("Cactus game contracts configured");
  console.log(JSON.stringify({ roles }, null, 2));
}

function readAddress(envName: string): string {
  const value = process.env[envName];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing ${envName}`);
  }

  return value;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
