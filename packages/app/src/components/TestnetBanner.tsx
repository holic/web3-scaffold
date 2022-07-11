import React from "react";
import { useNetwork } from "wagmi";

const TestnetBanner = () => {
  const network = useNetwork();

  return network?.activeChain?.testnet ? (
    <div className="bg-yellow-500 w-full flex justify-center items-center h-8 text-white">
      <p>{network?.activeChain?.network} testnet</p>{" "}
    </div>
  ) : (
    <div />
  );
};

export default TestnetBanner;
