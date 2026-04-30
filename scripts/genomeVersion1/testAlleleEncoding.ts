import { decodeGenome } from "./decodeGenomeHash";
import { cactus_0_0 } from "./Gen0Cactuses/cactus_0_0";

function testGenomeRoundtrip() {
  const encoded = cactus_0_0; 

  const decoded = decodeGenome(encoded.genomeBigInt);

  console.log("INPUT:", cactus_0_0);
  console.log("ENCODED (uint256):", encoded.genomeHex);
  console.log("DECODED:", decoded);
}

testGenomeRoundtrip();