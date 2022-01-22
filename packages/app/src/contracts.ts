import deploys from "@web3-dapp-scaffold/contracts/deploys.json";
import { ExampleNFT__factory } from "@web3-dapp-scaffold/contracts/typechain-types";

import { polygonProvider } from "./providers";

const network = process.env.NODE_ENV === "production" ? "matic" : "mumbai";

export const exampleNFTContract = ExampleNFT__factory.connect(
  deploys[network].ExampleNFT.address,
  polygonProvider
);
