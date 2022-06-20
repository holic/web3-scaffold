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
  const [pixels, setPixels] = React.useState([false, false, false, false]);

  const handleChange = (e: any) => {
    const pixelIndex = parseInt(e.target.id);
    console.log({ pixelIndex });
    var newPixels = pixels;
    newPixels[pixelIndex] = !newPixels[pixelIndex];
    console.log({ newPixels });
    setPixels(newPixels);
    console.log({ pixels });
  };

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
      <div className="flex-grow flex flex-col gap-4 items-center justify-center p-8 pb-[50vh]">
        <h1 className="text-4xl">Daily Canvas</h1>

        <p>
          <i>prompt: </i>
          {p.data?.toString() ?? "??"}
        </p>

        <div className="draw">
          <Editor x={-100} y={-100} hideMinimap closeModal={() => null} />
        </div>

        {/* <div className="draw">
          <Editor
            x={-100}
            y={-100}
            hideControls
            hideMinimap
            closeModal={() => null}
          />
          <style jsx>{`
            .draw {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          `}</style>
        </div> */}

        <MintButton />
        {/* <Inventory /> */}
      </div>
      <div className="gallery flex flex-row space-x-5 bottom-0">
        {data?.dailies &&
          data.dailies.map((el: any) => {
            return (
              <div className="galleryItem flex flex-col">
                <span>
                  {el.author.slice(0, 8)}..{el.author.slice(-6)}
                </span>
                <span>{el.promptId}</span>
              </div>
            );
          })}
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
          position: absolute;
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
