import { AbiCoder, getBytes, keccak256 } from "ethers";
import { network } from "hardhat";
import type {
  HardhatEthers,
  HardhatEthersSigner,
} from "@nomicfoundation/hardhat-ethers/types";
import type {
  Cactus721Contract,
  CactusBreedingContract,
  CactusGerminationContract,
  MockVRFContract,
  Seed721Contract,
} from "../../scripts/deploy/shared/cactusGameContractTypes";

export async function deployCactusGameFixture() {
  const connection = await network.connect();
  const ethers = connection.ethers;
  const [admin, player, feeRecipient, bot] = await ethers.getSigners();

  const Cactus721 = await ethers.getContractFactory("Cactus721");
  const Seed721 = await ethers.getContractFactory("Seed721");
  const MockVRF = await ethers.getContractFactory("MockVRF");
  const CactusBreeding = await ethers.getContractFactory(
    "CactusBreeding" as string
  );
  const CactusGermination = await ethers.getContractFactory(
    "CactusGermination"
  );

  const cactus = (await Cactus721.deploy(
    "Cacti",
    "CACTI",
    "https://example.com/cactus/"
  )) as unknown as Cactus721Contract;
  const seeds = (await Seed721.deploy(
    "Cactus Seeds",
    "SEED",
    "https://example.com/seeds/"
  )) as unknown as Seed721Contract;
  const vrf = (await MockVRF.deploy()) as unknown as MockVRFContract;
  const breedingFee = ethers.parseEther("0.01");
  const breeding = (await CactusBreeding.deploy(
    await cactus.getAddress(),
    await seeds.getAddress(),
    breedingFee,
    feeRecipient.address
  )) as unknown as CactusBreedingContract;
  const germination = (await CactusGermination.deploy(
    await cactus.getAddress(),
    await seeds.getAddress(),
    await vrf.getAddress()
  )) as unknown as CactusGerminationContract;

  await cactus.grantRole(await cactus.GAME_ROLE(), await breeding.getAddress());
  await cactus.grantRole(
    await cactus.GAME_ROLE(),
    await germination.getAddress()
  );
  await seeds.grantRole(await seeds.GAME_ROLE(), await breeding.getAddress());
  await seeds.grantRole(await seeds.GAME_ROLE(), await germination.getAddress());
  await breeding.setGerminationChanceBps(10_000);

  return {
    ethers,
    admin,
    player,
    feeRecipient,
    bot,
    cactus,
    seeds,
    vrf,
    breeding,
    germination,
    breedingFee,
  };
}

export async function futureDeadline(ethers: HardhatEthers): Promise<bigint> {
  const block = await ethers.provider.getBlock("latest");
  const timestamp = BigInt(block?.timestamp ?? 0);

  return timestamp + 3_600n;
}

export async function signBreed(
  ethers: HardhatEthers,
  signer: HardhatEthersSigner,
  breeding: CactusBreedingContract,
  breeder: string,
  parentA: number,
  parentB: number,
  childGenome: bigint | number,
  deadline: bigint
): Promise<string> {
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const nonce = await breeding.breedingNonces(breeder);
  const digest = keccak256(
    AbiCoder.defaultAbiCoder().encode(
      [
        "uint256",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        chainId,
        await breeding.getAddress(),
        breeder,
        parentA,
        parentB,
        childGenome,
        nonce,
        deadline,
      ]
    )
  );

  return signer.signMessage(getBytes(digest));
}

export async function signGermination(
  ethers: HardhatEthers,
  signer: HardhatEthersSigner,
  germination: CactusGerminationContract,
  owner: string,
  seedId: number,
  deadline: bigint
): Promise<string> {
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const nonce = await germination.germinationNonces(owner);
  const digest = keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ["uint256", "address", "address", "uint256", "uint256", "uint256"],
      [chainId, await germination.getAddress(), owner, seedId, nonce, deadline]
    )
  );

  return signer.signMessage(getBytes(digest));
}
