import ExampleNFTGoerli from "@web3-scaffold/contracts/deploys/goerli/ExampleNFT.json";
import { ExampleNFT__factory } from "@web3-scaffold/contracts/types";

import { ethereumProvider } from "./providers";

export const exampleNFTContract = ExampleNFT__factory.connect(
  ExampleNFTGoerli.deployedTo,
  ethereumProvider
);
