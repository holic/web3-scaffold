import type { NextPage } from "next";
import React from "react";
import { useQuery } from "urql";
import Editor from "../components/Editor";
import SVG from "react-inlinesvg";
import Link from "next/link";

import { usedailyCanvasContractRead } from "../contracts";
import { wagmiClient } from "../EthereumProviders";
import { MintButton } from "../MintButton";
import useDailies from "../hooks/use-daily-canvas";

import Header from "../components/Header";

// todo: order?
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
  const [result, reexecuteQuery] = useDailies();

  // @ts-ignore
  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;
  console.log("data", data);

  return (
    <div className="flex flex-col bg-black h-screen w-full font-mono text-white">
      <Header title="Daily Canvas"></Header>
      <div className="h-96 p-6">
        {data.length ? (
          <SVG
            src={data[data.length - 1].svg}
            width={"auto"}
            height={"auto"}
            className={"svgFix"}
          ></SVG>
        ) : null}
        <div className="flex flex-col">
          <div className="flex justify-center pb-2 pt-4 z-50">
            <Link href="/editor">
              <button>Edit Canvas</button>
            </Link>
          </div>
          <div className="flex justify-center z-50">
            {data.length ? (
              <Link href={`/canvas/${data?.[data.length - 1].id}/view`}>
                <button>View Feed</button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
