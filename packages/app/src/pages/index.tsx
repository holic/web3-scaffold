import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useEffect, useState } from "react";

import { useExampleNFTContractRead } from "../contracts";
import { Inventory } from "../Inventory";
import { MintButton } from "../MintButton";

const HomePage: NextPage = () => {
  const totalSupply = useExampleNFTContractRead("totalSupply", {
    watch: true,
  });
  const maxSupply = useExampleNFTContractRead("MAX_SUPPLY");

  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    setHasLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="self-end p-2">
        <ConnectButton />
      </div>
      <div className="flex-grow flex flex-col gap-4 items-center justify-center p-8 pb-[50vh]">
        <h1 className="text-4xl">Example NFT</h1>

        {hasLoaded && (
          <p>
            {totalSupply.data?.toNumber().toLocaleString() ?? "??"}/
            {maxSupply.data?.toNumber().toLocaleString() ?? "??"} minted
          </p>
        )}

        <MintButton />
        <Inventory />
      </div>
    </div>
  );
};

export default HomePage;
