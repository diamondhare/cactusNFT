import type {
  AddressLike,
  BaseContract,
  BigNumberish,
  ContractRunner,
  ContractTransactionResponse,
} from "ethers";

export type CactusData = {
  genome: bigint;
  parentA: bigint;
  parentB: bigint;
  generation: bigint;
};

export type SeedData = {
  genome: bigint;
  parentA: bigint;
  parentB: bigint;
  generation: bigint;
  germinationChanceBps: bigint;
  createdAt: bigint;
};

export type RoleManagedContract = BaseContract & {
  getAddress(): Promise<string>;
  hasRole(role: string, account: AddressLike): Promise<boolean>;
  grantRole(
    role: string,
    account: AddressLike
  ): Promise<ContractTransactionResponse>;
};

export type Cactus721Contract = RoleManagedContract & {
  GAME_ROLE(): Promise<string>;
  ownerOf(tokenId: BigNumberish): Promise<string>;
  getApproved(tokenId: BigNumberish): Promise<string>;
  isApprovedForAll(owner: AddressLike, operator: AddressLike): Promise<boolean>;
  approve(
    operator: AddressLike,
    tokenId: BigNumberish
  ): Promise<ContractTransactionResponse>;
  setApprovalForAll(
    operator: AddressLike,
    approved: boolean
  ): Promise<ContractTransactionResponse>;
  mintOriginCactus(
    to: AddressLike,
    genome: BigNumberish
  ): Promise<ContractTransactionResponse>;
  mintGen1Cactus(
    to: AddressLike,
    genome: BigNumberish
  ): Promise<ContractTransactionResponse>;
  cactusData(tokenId: BigNumberish): Promise<CactusData>;
  connect(runner: ContractRunner | null): Cactus721Contract;
};

export type Seed721Contract = RoleManagedContract & {
  GAME_ROLE(): Promise<string>;
  ownerOf(tokenId: BigNumberish): Promise<string>;
  mint(
    to: AddressLike,
    genome: BigNumberish,
    parentA: BigNumberish,
    parentB: BigNumberish,
    generation: BigNumberish,
    germinationChanceBps: BigNumberish
  ): Promise<ContractTransactionResponse>;
  approve(
    operator: AddressLike,
    tokenId: BigNumberish
  ): Promise<ContractTransactionResponse>;
  transferFrom(
    from: AddressLike,
    to: AddressLike,
    tokenId: BigNumberish
  ): Promise<ContractTransactionResponse>;
  seedData(tokenId: BigNumberish): Promise<SeedData>;
  connect(runner: ContractRunner | null): Seed721Contract;
};

export type CactusBreedingContract = RoleManagedContract & {
  BACKEND_SIGNER_ROLE(): Promise<string>;
  breedingNonces(account: AddressLike): Promise<bigint>;
  germinationChanceBps(): Promise<bigint>;
  setGerminationChanceBps(
    germinationChanceBps: BigNumberish
  ): Promise<ContractTransactionResponse>;
  openForBreeding(tokenId: BigNumberish): Promise<ContractTransactionResponse>;
  closeForBreeding(tokenId: BigNumberish): Promise<ContractTransactionResponse>;
  isOpenForBreeding(tokenId: BigNumberish): Promise<boolean>;
  breedWithSignature(
    parentA: BigNumberish,
    parentB: BigNumberish,
    childGenome: BigNumberish,
    deadline: BigNumberish,
    backendSignature: string,
    overrides?: { value?: BigNumberish }
  ): Promise<ContractTransactionResponse>;
  connect(runner: ContractRunner | null): CactusBreedingContract;
};

export type CactusGerminationContract = RoleManagedContract & {
  BACKEND_SIGNER_ROLE(): Promise<string>;
  germinationNonces(account: AddressLike): Promise<bigint>;
  germinateWithSignature(
    seedId: BigNumberish,
    deadline: BigNumberish,
    backendSignature: string
  ): Promise<ContractTransactionResponse>;
  connect(runner: ContractRunner | null): CactusGerminationContract;
};

export type MockVRFContract = BaseContract & {
  getAddress(): Promise<string>;
};
