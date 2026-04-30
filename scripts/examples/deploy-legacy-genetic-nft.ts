import { network } from "hardhat";
import type { GeneticNFT } from "../../types/ethers-contracts/ERC721NFT.sol/GeneticNFT.js";

const { ethers } = await network.connect();

async function main() {
  console.log("Deploying GeneticNFT contract...");

  const GeneticNFT = await ethers.getContractFactory("GeneticNFT");
  const geneticNFT = (await GeneticNFT.deploy(
    "GeneticNFT",
    "GNFT",
    "https://example.com/"
  )) as GeneticNFT;

  await geneticNFT.waitForDeployment();

  const address = await geneticNFT.getAddress();
  console.log("GeneticNFT deployed to:", address);

  // Optional: Mint a test NFT
  const [deployer] = await ethers.getSigners();
  console.log("Minting a test NFT to deployer:", deployer.address);
  const mintTx = await geneticNFT.mint(deployer.address);
  await mintTx.wait();
  console.log("Test NFT minted with ID 0");

  console.log("Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
