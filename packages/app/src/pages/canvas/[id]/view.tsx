import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import React from "react";
import { useQuery } from "urql";
import { useRouter } from "next/router";
import SVG from "react-inlinesvg";

import { usedailyCanvasContractRead } from "../../../contracts";
import { wagmiClient } from "../../../EthereumProviders";
import { json } from "node:stream/consumers";

const CanvasQuery = `
  query {
    dailies(first: 100) {
      id
      author
      tokenURI
      promptId
    }
  }
`;

const SpecificCanvasQuery = `
  query CanvasQuery($canvasId: ID!) {
    dailies(where: { id: $canvasId }) {
      id
      author
      tokenURI
      promptId
      svg
    }
}`;

const HomePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [result, reexecuteQuery] = useQuery({
    query: SpecificCanvasQuery,
    variables: {
      canvasId: id,
      id: id,
    },
  });

  console.log(id);

  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;
  console.log("data", data);

  const decode = (str: string): string =>
    Buffer.from(str, "base64").toString("binary");
  const encode = (str: string): string =>
    Buffer.from(str, "binary").toString("base64");

  // test('base64 decode', () => {
  //   expect(decode(b64)).toEqual(str)
  // });

  // test('base64 decode', () => {
  //   expect(encode(str)).toEqual(b64)
  // });

  // test('base64 encode/decode', () => {
  //   expect(decode(encode(str))).toEqual(str)
  // });

  if (data && data.dailies && data.dailies.length) {
    const outer = decode(
      data.dailies[0]["tokenURI"].replace("data:application/json;base64,", "")
    );
    // const inner = decode(outer.replace(""));
    console.log({ outer });
    // console.log(JSON.parse(outer));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="self-end p-2">
        <ConnectButton />
      </div>
      <div className="flex-grow flex flex-col gap-4 items-center justify-center">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl">Daily Canvas</h1>
          <h2>Canvas #{id}</h2>
          {/* <img src={data?.dailies[0].svg}></img> */}
          <SVG src={data?.dailies[0].svg} />;
        </div>
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
