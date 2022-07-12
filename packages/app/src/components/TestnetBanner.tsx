import React from "react";
import { useNetwork, useConnect, chain } from "wagmi";
import { targetChainId } from "../EthereumProviders";
import { switchChain } from "../switchChain";

const TestnetBanner = () => {
  const network = useNetwork();
  const { activeConnector } = useConnect();

  const wrongChain =
    network?.activeChain && network?.activeChain?.id !== targetChainId;

  const handleClick = () => {
    if (activeConnector) {
      switchChain(activeConnector);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-yellow-500 w-full flex justify-center items-center h-8 text-white select-none ${
        !wrongChain ? "cursor-default" : ""
      }`}
    >
      <p>
        {wrongChain ? "switch to " : ""} {chain.rinkeby.name.toLowerCase()}{" "}
        testnet
      </p>{" "}
    </button>
  );
};

export default TestnetBanner;
