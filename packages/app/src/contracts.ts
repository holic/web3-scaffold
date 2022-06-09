import ExampleNFTGoerli from "@web3-scaffold/contracts/deploys/goerli/ExampleNFT.json";
import {
  ExampleNFT,
  ExampleNFT__factory,
} from "@web3-scaffold/contracts/types";
import { Contract } from "ethers";

// I would have used `ExampleNFT__factory.connect` to create this, but we may
// not have a provider ready to go. Any interactions with this contract should
// use `exampleNFTContract.connect(providerOrSigner)` first.

export const exampleNFTContract = new Contract(
  ExampleNFTGoerli.deployedTo,
  ExampleNFT__factory.abi
) as ExampleNFT;
