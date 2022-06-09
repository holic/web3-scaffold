import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Example NFT</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <div className="self-end p-2">
          <ConnectButton />
        </div>
        <div className="flex-grow flex flex-col gap-4 items-center justify-center pb-[25vh]">
          <h1 className="text-4xl">Example NFT</h1>
          <p>sup</p>
          <p>do yo thang</p>
        </div>
      </div>
    </>
  );
};

export default HomePage;
