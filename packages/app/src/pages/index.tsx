import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import { useContractRead } from "wagmi";

import { exampleNFTContract } from "../contracts";

const HomePage: NextPage = () => {
  const totalSupply = useContractRead(
    {
      addressOrName: exampleNFTContract.address,
      contractInterface: exampleNFTContract.interface,
    },
    "totalSupply"
  );
  const maxSupply = useContractRead(
    {
      addressOrName: exampleNFTContract.address,
      contractInterface: exampleNFTContract.interface,
    },
    "MAX_SUPPLY"
  );

  return (
    <>
      <Head>
        <title>Example NFT</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <div className="self-end p-2">
          <ConnectButton />
        </div>
        <div className="flex-grow flex flex-col gap-4 items-center justify-center p-8 pb-[50vh]">
          <h1 className="text-4xl">Example NFT</h1>
          <p>
            {totalSupply.data?.toNumber().toLocaleString() ?? "??"}/
            {maxSupply.data?.toNumber().toLocaleString() ?? "??"} minted
          </p>
        </div>
      </div>
    </>
  );
};

export default HomePage;
