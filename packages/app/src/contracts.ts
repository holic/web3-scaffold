import { ExampleNFT__factory } from "@web3-scaffold/contracts/types";
import { useContractRead } from "wagmi";

import { provider, targetChainId } from "./EthereumProviders";
import { getContractAddress } from "./utils/getContractAddress";

// I would have used `ExampleNFT__factory.connect` to create this, but we may
// not have a provider ready to go. Any interactions with this contract should
// use `exampleNFTContract.connect(providerOrSigner)` first.

// export const exampleNFTContract = new Contract(
//   getContractAddress(),
//   ExampleNFT__factory.abi
// ) as ExampleNFT;

const contractAddress = getContractAddress();

export const exampleNFTContract = ExampleNFT__factory.connect(
  contractAddress,
  provider({ chainId: targetChainId })
);

export const useExampleNFTContractRead = (
  readConfig: Omit<
    Parameters<typeof useContractRead>[0],
    "addressOrName" | "contractInterface"
  >
) =>
  useContractRead({
    ...readConfig,
    addressOrName: contractAddress,
    contractInterface: ExampleNFT__factory.abi,
  });
