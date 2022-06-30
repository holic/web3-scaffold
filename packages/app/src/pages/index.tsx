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
      svg
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
      <div className="flex-grow flex flex-col gap-4 items-center justify-center p-8">
        <img className="logo" src="/static/IMG_6784.png"></img>

        {/* <div className="flex flex-row">
          <p>
            <i>prompt: </i>
            {p.data?.toString() ?? "??"}
          </p>
        </div> */}

        <div className="draw">
          <Editor
            x={-100}
            y={-100}
            hideMinimap
            refetchCanvases={reexecuteQuery}
            result={result}
            closeModal={() => null}
          />
        </div>

        {/* <MintButton /> */}
      </div>
      <style jsx>{`
        .gallery {
        }
        .logo {
          width: 230px;
        }
        .galleryItem {
          width: 150px;
          height: 150px;
          background-color: red;
        }
        .draw {
          justify-content: center;
          align-items: center;

          margin-left: -50px;
        }
      `}</style>
      ;
    </div>
  );
};

export default HomePage;
