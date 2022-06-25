import ExampleNFTFoundry from "@web3-scaffold/contracts/deploys/foundry/ExampleNFT.json";
// import ExampleNFTGoerli from "@web3-scaffold/contracts/deploys/goerli/ExampleNFT.json";
import { ExampleNFT__factory } from "@web3-scaffold/contracts/types";
import { useContractRead } from "wagmi";

import { provider, targetChainId } from "./EthereumProviders";

// I would have used `ExampleNFT__factory.connect` to create this, but we may
// not have a provider ready to go. Any interactions with this contract should
// use `exampleNFTContract.connect(providerOrSigner)` first.

// export const exampleNFTContract = new Contract(
//   ExampleNFTGoerli.deployedTo,
//   ExampleNFT__factory.abi
// ) as ExampleNFT;

export const exampleNFTContract = ExampleNFT__factory.connect(
  ExampleNFTFoundry.deployedTo,
  provider({ chainId: targetChainId })
);

export const useExampleNFTContractRead = useContractRead.bind(null, {
  addressOrName: ExampleNFTFoundry.deployedTo,
  contractInterface: ExampleNFT__factory.abi,
});
