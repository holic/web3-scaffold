import type { NextPage } from "next";
import React from "react";
import SVG from "react-inlinesvg";
import Link from "next/link";

import useDailies from "../hooks/use-daily-canvases";

import Header from "../components/Header";
import { CANVAS_SIZE, PIXEL_SIZE } from "../constants/Editor";

// // todo: order?
// const CanvasQuery = `
//   query {
//     dailies(first: 100) {
//       id
//       author
//       svg
//       tokenURI
//       promptId
//       riffCanvasId
//     }
//   }
// `;

// const IndividualCanvasQuery = `query IndividualCanvasQuery($canvasId: ID) {
//     dailies(where: {id: $canvasId}) {
//       id
//       author
//       svg
//       tokenURI
//       promptId
//     }
//   }
// `;

const HomePage: NextPage = () => {
  const [result, reexecuteQuery] = useDailies();

  // @ts-ignore
  const { data = [] } = result;

  const handleHeaderClick = () => {
    // @ts-ignore
    reexecuteQuery({
      requestPolicy: "cache-and-network",
    });
  };

  return (
    <div className="flex flex-col h-screen w-full items-center text-white">
      <Header onClick={handleHeaderClick} title="Daily Canvas"></Header>
      <div className="h-96 pt-4 p-6">
        {data.length ? (
          <SVG
            src={data[data.length - 1].svg}
            width={CANVAS_SIZE * PIXEL_SIZE}
            height={CANVAS_SIZE * PIXEL_SIZE}
            className={"svgFix"}
          ></SVG>
        ) : null}
        <div className="flex flex-col">
          <div className="flex justify-center pb-2 pt-4 z-50">
            {/* todo: pass riff id as current */}
            {data.length ? (
              <>
                <Link href={`/canvas/${data[data.length - 1].id}/riff`}>
                  <button>Edit Canvas</button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/editor">
                  <button>Edit Canvas</button>
                </Link>
              </>
            )}
          </div>
          <div className="flex justify-center z-50">
            {data.length ? (
              <Link href={`/canvas/${data[data.length - 1].id}/view`}>
                <button>View Feed ({data.length} edits)</button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
