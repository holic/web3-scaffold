// import ExampleNFTGoerli from "@web3-scaffold/contracts/deploys/goerli/ExampleNFT.json";
import DailyCanvas from "@web3-scaffold/contracts/deploys/rinkeby/DailyCanvas.json";
// import { ExampleNFT__factory } from "@web3-scaffold/contracts/types";
import { useContractRead } from "wagmi";

import { provider, targetChainId } from "./EthereumProviders";
import { DailyCanvas__factory } from "./types/factories";

// I would have used `ExampleNFT__factory.connect` to create this, but we may
// not have a provider ready to go. Any interactions with this contract should
// use `exampleNFTContract.connect(providerOrSigner)` first.

// export const exampleNFTContract = new Contract(
//   ExampleNFTGoerli.deployedTo,
//   ExampleNFT__factory.abi
// ) as ExampleNFT;

// export const exampleNFTContract = ExampleNFT__factory.connect(
//   ExampleNFTGoerli.deployedTo,
//   provider({ chainId: targetChainId })
// );

export const dailyCanvasContract = DailyCanvas__factory.connect(
  DailyCanvas.deployedTo,
  provider({ chainId: targetChainId })
);

// export const useExampleNFTContractRead = useContractRead.bind(null, {
//   addressOrName: ExampleNFTGoerli.deployedTo,
//   contractInterface: ExampleNFT__factory.abi,
// });

export const usedailyCanvasContractRead = useContractRead.bind(null, {
  addressOrName: DailyCanvas.deployedTo,
  contractInterface: DailyCanvas__factory.abi,
});

// export const currentPrompt = useContractRead.bind("currentPrompt", {
//   addressOrName: DailyCanvas.deployedTo,
//   contractInterface: DailyCanvas__factory.abi,
// });
