import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CactusGameModule = buildModule("CactusGameModule", (m) => {
  const admin = m.getAccount(0);
  const breedingFee = m.getParameter("breedingFee", 0n);

  const cactus = m.contract("Cactus721", [
    "Cacti",
    "CACTI",
    "https://example.com/cactus/",
  ]);
  const seeds = m.contract("Seed721", [
    "Cactus Seeds",
    "SEED",
    "https://example.com/seeds/",
  ]);
  const vrf = m.contract("MockVRF");
  const breeding = m.contract("CactusBreeding", [
    cactus,
    seeds,
    breedingFee,
    admin,
  ]);
  const germination = m.contract("CactusGermination", [
    cactus,
    seeds,
    vrf,
  ]);

  const cactusGameRole = m.staticCall(cactus, "GAME_ROLE");
  const seedGameRole = m.staticCall(seeds, "GAME_ROLE");

  m.call(cactus, "grantRole", [cactusGameRole, breeding], {
    id: "GrantCactusGameRoleToBreeding",
  });
  m.call(cactus, "grantRole", [cactusGameRole, germination], {
    id: "GrantCactusGameRoleToGermination",
  });
  m.call(seeds, "grantRole", [seedGameRole, breeding], {
    id: "GrantSeedGameRoleToBreeding",
  });
  m.call(seeds, "grantRole", [seedGameRole, germination], {
    id: "GrantSeedGameRoleToGermination",
  });

  return { cactus, seeds, breeding, germination, vrf };
});

export default CactusGameModule;
