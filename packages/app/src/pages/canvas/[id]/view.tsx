import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "urql";
import { useRouter } from "next/router";
import SVG from "react-inlinesvg";
import useDailies from "../../../hooks/use-daily-canvas";
import Link from "next/link";
import Button from "../../../components/Button";
import { getSVGPixels } from "@exquisite-graphics/js";

import {
  usedailyCanvasContractRead,
  dailyCanvasContract,
} from "../../../contracts";
import { wagmiClient } from "../../../EthereumProviders";
import { json } from "node:stream/consumers";
import Header from "../../../components/Header";

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

  const [svgData, setSVGData] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchSVG = async () => {
      const data = await dailyCanvasContract.getTileSVG(String(id));
      setSVGData(data);
    };
    if (id) {
      fetchSVG();
    }
  }, [id]);

  // const [result, reexecuteQuery] = useQuery({
  //   query: SpecificCanvasQuery,
  //   variables: {
  //     canvasId: id,
  //     id: id,
  //   },
  // });

  // console.log(id);

  // const { data, fetching, error } = result;

  // if (fetching) return <p>Loading...</p>;
  // if (error) return <p>Oh no... {error.message}</p>;
  // console.log("data", data);

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

  // if (data && data.dailies && data.dailies.length) {
  //   const outer = decode(
  //     data.dailies[0]["tokenURI"].replace("data:application/json;base64,", "")
  //   );
  //   // const inner = decode(outer.replace(""));
  //   console.log({ outer });
  //   // console.log(JSON.parse(outer));
  // }

  const [result, reexecuteQuery] = useDailies();

  // @ts-ignore
  const { data, fetching, error } = result;

  const nextCanvas = useMemo(
    () =>
      data?.find((x: any) => {
        return Number(x.id) === Number(id) + 1;
      }) || NaN,
    [data, id]
  );
  const previousCanvas = useMemo(
    () =>
      data?.find((x: any) => {
        return Number(x.id) === Number(id) - 1;
      }) || NaN,
    [data, id]
  );
  console.log({
    previousCanvas,
    nextCanvas,
  });

  return (
    <div className="flex flex-col bg-black h-screen w-full items-center">
      <Header title="Daily Canvas"></Header>
      <div className="h-96 p-6 w-96">
        <SVG
          src={data?.[Number(id) - 1].svg}
          width={"auto"}
          height={"auto"}
          className={"svgFix"}
        ></SVG>
        <div className="flex flex-col h-full">
          <div className="w-full flex flex-row justify-between my-2 font-mono text-white">
            <Link href={`/canvas/${previousCanvas.id}/view`}>
              <button
                disabled={!previousCanvas}
                className="disabled:opacity-30"
              >
                ⬅️ prev
              </button>
            </Link>

            <div>
              <span>..{data?.[Number(id) - 1].author.slice(-8)}</span>
            </div>

            <Link href={`/canvas/${nextCanvas.id}/view`}>
              <button disabled={!nextCanvas} className="disabled:opacity-30">
                next ➡️{" "}
              </button>
            </Link>
          </div>
          <div className="flex flex-1 "></div>
          <div className="flex justify-center mx-auto py-3 w-48 border-1 border-black bg-white text-black">
            <Link href="/editor">
              <Button
                onClick={() => {
                  console.log("hi");
                }}
              >
                <span>Riff</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
