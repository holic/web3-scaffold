import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import React from "react";
import { useQuery } from "urql";
import Editor from "../components/Editor";

import {
  // currentPrompt,
  dailyCanvasContract,
  usedailyCanvasContractRead,
} from "../contracts";
import { wagmiClient } from "../EthereumProviders";
import { MintButton } from "../MintButton";

const CanvasQuery = `
  query {
    dailies(first: 100) {
      id
      author
      pixelFilled
      tokenURI
      promptId
    }
  }
`;

const HomePage: NextPage = () => {
  const p = usedailyCanvasContractRead("getCurrentPrompt");

  const [result, reexecuteQuery] = useQuery({
    query: CanvasQuery,
  });

  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;
  console.log("data", data);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="self-end p-2">
        <ConnectButton />
      </div>
      <div className="flex-grow flex flex-col gap-4 items-center justify-center">
        <div className="flex flex-row">
          <h1 className="text-4xl">Daily Canvas</h1>
        </div>
        <div className="flex flex-row">
          <p>
            <i>prompt: </i>
            {p.data?.toString() ?? "??"}
          </p>
        </div>

        <div className="draw">
          <Editor x={-100} y={-100} hideMinimap closeModal={() => null} />
        </div>

        <MintButton />
      </div>
      <style jsx>{`
        .gallery {
        }
        .galleryItem {
          width: 150px;
          height: 150px;
          background-color: red;
        }
        .draw {
          position: relative;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
      ;
    </div>
  );
};

export default HomePage;
