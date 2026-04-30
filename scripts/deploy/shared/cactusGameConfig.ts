export type CactusGameDeploymentConfig = {
  cactusName: string;
  cactusSymbol: string;
  cactusBaseUri: string;
  seedName: string;
  seedSymbol: string;
  seedBaseUri: string;
  breedingFee: bigint;
};

export const LOCAL_CACTUS_GAME_CONFIG: CactusGameDeploymentConfig = {
  cactusName: "Cacti",
  cactusSymbol: "CACTI",
  cactusBaseUri: "https://example.com/cactus/",
  seedName: "Cactus Seeds",
  seedSymbol: "SEED",
  seedBaseUri: "https://example.com/seeds/",
  breedingFee: 0n,
};
