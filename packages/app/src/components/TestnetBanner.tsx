import React from "react";
import { useNetwork } from "wagmi";

export enum Testnets {
  RINKEBY = "rinkeby",
  ROPSTEN = "ropsten",
  KOVAN = "kovan",
  GOERLI = "goerli",
}

interface TestnetBannerProps {
  testnet?: Testnets;
}

const TestnetBanner = ({ testnet }: TestnetBannerProps) => {
  const network = useNetwork();
  console.log(network);

  return (
    network?.activeChain?.testnet && (
      <div className="bg-yellow-500 w-full flex justify-center items-center h-8 text-white">
        <p>{testnet || network?.activeChain?.network} testnet</p>{" "}
      </div>
    )
  );
};

export default TestnetBanner;
