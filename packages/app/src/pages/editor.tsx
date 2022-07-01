import type { NextPage } from "next";
import React from "react";
import { useQuery } from "urql";
import Editor from "../components/Editor";
import Header from "../components/Header";

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
    <div className="flex flex-col bg-black h-screen w-full">
      <Header title="Daily Canvas"></Header>
      <div className="flex-grow flex flex-col items-center ">
        {/* <div className="flex flex-row">
          <p>
            <i>prompt: </i>
            {p.data?.toString() ?? "??"}
          </p>
        </div> */}

        <div className="flex justify-center h-full">
          <Editor
            x={-100}
            y={-100}
            hideMinimap
            refetchCanvases={reexecuteQuery}
            result={result}
            closeModal={() => null}
          />
        </div>
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
      `}</style>
    </div>
  );
};

export default HomePage;
