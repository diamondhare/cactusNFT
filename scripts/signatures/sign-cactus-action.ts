import { AbiCoder, getBytes, keccak256, Wallet } from "ethers";

type Action = "breed" | "germinate";

const abiCoder = AbiCoder.defaultAbiCoder();

const action = readArg("action") as Action;
const privateKey = readEnv("BACKEND_PRIVATE_KEY");
const signer = new Wallet(privateKey);

if (action === "breed") {
  const digest = keccak256(
    abiCoder.encode(
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
        readBigIntArg("chain-id"),
        readArg("contract"),
        readArg("breeder"),
        readBigIntArg("parent-a"),
        readBigIntArg("parent-b"),
        readBigIntArg("child-genome"),
        readBigIntArg("nonce"),
        readBigIntArg("deadline"),
      ]
    )
  );

  await printSignature(digest);
} else if (action === "germinate") {
  const digest = keccak256(
    abiCoder.encode(
      ["uint256", "address", "address", "uint256", "uint256", "uint256"],
      [
        readBigIntArg("chain-id"),
        readArg("contract"),
        readArg("owner"),
        readBigIntArg("seed-id"),
        readBigIntArg("nonce"),
        readBigIntArg("deadline"),
      ]
    )
  );

  await printSignature(digest);
} else {
  throw new Error("Unsupported action. Use --action breed or --action germinate");
}

async function printSignature(digest: string) {
  const signature = await signer.signMessage(getBytes(digest));

  console.log(
    JSON.stringify(
      {
        signer: signer.address,
        digest,
        signature,
      },
      null,
      2
    )
  );
}

function readArg(name: string): string {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing --${name}`);
  }

  return value;
}

function readBigIntArg(name: string): bigint {
  return BigInt(readArg(name));
}

function readEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}
