import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";

import {
  // currentPrompt,
  dailyCanvasContract,
  usedailyCanvasContractRead,
} from "../contracts";
import { wagmiClient } from "../EthereumProviders";
import { Inventory } from "../Inventory";
import { MintButton } from "../MintButton";

const HomePage: NextPage = () => {
  const p = usedailyCanvasContractRead("getCurrentPrompt");
  console.log(p.data);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="self-end p-2">
        <ConnectButton />
      </div>
      <div className="flex-grow flex flex-col gap-4 items-center justify-center p-8 pb-[50vh]">
        <h1 className="text-4xl">Daily Canvas</h1>

        <p>
          <i>prompt: </i>
          {p.data?.toString() ?? "??"}
        </p>

        <MintButton />
        <Inventory />
      </div>
    </div>
  );
};

export default HomePage;
