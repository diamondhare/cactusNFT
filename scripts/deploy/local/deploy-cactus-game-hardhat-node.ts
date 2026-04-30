import { network } from "hardhat";
import { LOCAL_CACTUS_GAME_CONFIG } from "../shared/cactusGameConfig";
import { configureCactusGameContracts } from "../shared/configureCactusGameContracts";
import { deployCactusGameContracts } from "../shared/deployCactusGameContracts";

const connection = await network.connect({
  network: "localhost",
  chainType: "l1",
});
const { ethers } = connection;

async function main() {
  const [deployer, feeRecipient] = await ethers.getSigners();
  const feeRecipientAddress = feeRecipient?.address ?? deployer.address;

  console.log("Deploying cactus game contracts to http://127.0.0.1:8545");
  console.log("Deployer:", deployer.address);
  console.log("Fee recipient:", feeRecipientAddress);

  const contracts = await deployCactusGameContracts(
    ethers,
    LOCAL_CACTUS_GAME_CONFIG,
    feeRecipientAddress
  );
  const roles = await configureCactusGameContracts(contracts);

  console.log("Deployment complete");
  console.log(
    JSON.stringify(
      {
        network: "localhost",
        rpcUrl: "http://127.0.0.1:8545",
        deployer: deployer.address,
        feeRecipient: feeRecipientAddress,
        contracts: {
          cactus: await contracts.cactus.getAddress(),
          seeds: await contracts.seeds.getAddress(),
          breeding: await contracts.breeding.getAddress(),
          germination: await contracts.germination.getAddress(),
          vrf: await contracts.vrf.getAddress(),
        },
        roles,
        config: {
          ...LOCAL_CACTUS_GAME_CONFIG,
          breedingFee: LOCAL_CACTUS_GAME_CONFIG.breedingFee.toString(),
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
