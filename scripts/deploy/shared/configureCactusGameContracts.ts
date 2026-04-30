import type { CactusGameContracts } from "./deployCactusGameContracts";
import type { RoleManagedContract } from "./cactusGameContractTypes";

export type CactusGameRoleConfiguration = {
  cactusGameRole: string;
  seedGameRole: string;
};

export async function configureCactusGameContracts(
  contracts: CactusGameContracts
): Promise<CactusGameRoleConfiguration> {
  const cactusGameRole = await contracts.cactus.GAME_ROLE();
  const seedGameRole = await contracts.seeds.GAME_ROLE();

  await grantRoleIfMissing(
    contracts.cactus,
    cactusGameRole,
    await contracts.breeding.getAddress()
  );
  await grantRoleIfMissing(
    contracts.cactus,
    cactusGameRole,
    await contracts.germination.getAddress()
  );
  await grantRoleIfMissing(
    contracts.seeds,
    seedGameRole,
    await contracts.breeding.getAddress()
  );
  await grantRoleIfMissing(
    contracts.seeds,
    seedGameRole,
    await contracts.germination.getAddress()
  );

  return {
    cactusGameRole,
    seedGameRole,
  };
}

async function grantRoleIfMissing(
  contract: RoleManagedContract,
  role: string,
  account: string
) {
  if (await contract.hasRole(role, account)) {
    return;
  }

  const tx = await contract.grantRole(role, account);
  await tx.wait();
}
