import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { getSVG } from "@exquisite-graphics/js";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePixels } from "../components/usePixels";
import { dailyCanvasContract } from "../contracts";
import getPixelsFrom from "../utils/getPixelsFrom";

import useDailies from "../hooks/use-daily-canvases";

import Header from "../components/Header";
import { CANVAS_SIZE, PIXEL_SIZE } from "../constants/Editor";
import { Pixels } from "../hooks/use-editor";
import { toast } from "react-toastify";

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
  const [riffLoading, setRiffLoading] = useState<boolean>(false);
  const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  const router = useRouter();
  // @ts-ignore
  const { data = [] } = result;
  const latestCanvas = data?.[data.length - 1];

  const { pixelsHistory, replacePixels } = usePixels({
    keySuffix: latestCanvas?.id,
  });

  const handleRiffClick = () => {
    if (!latestCanvas) return;

    setRiffLoading(true);
    try {
      if (!pixels?.length) {
        toast(
          "Unable to read canvas data for riff, why not draw something new instead?"
        );
        router.push("/editor");
        return;
      }

      if (pixelsHistory?.length === 1) {
        // @ts-ignore
        replacePixels([pixels]);
      } else {
        toast(
          "You have some history with this canvas, we've loaded it for you!"
        );
      }
      setTimeout(() => {
        router.push(`/canvas/${latestCanvas?.id}/riff`);
      }, 600);
    } catch (e) {
      setRiffLoading(false);
    }
  };

  // @ts-ignore
  useEffect(() => {
    const fetchSVG = async () => {
      // const svgData = await dailyCanvasContract.getTileSVG(String(id));

      const dataRaw = await dailyCanvasContract.getCanvasPixels(
        String(latestCanvas?.id)
      );
      const svgData = getSVG(dataRaw);
      setPixels(getPixelsFrom(svgData));
    };
    if (latestCanvas && latestCanvas.id) {
      fetchSVG();
    }
  }, [latestCanvas?.id]);

  const handleHeaderClick = () => {
    // @ts-ignore
    reexecuteQuery({
      requestPolicy: "cache-and-network",
    });
  };

  return latestCanvas ? (
    <div className="flex flex-col h-screen w-full items-center text-white">
      <Header onClick={handleHeaderClick} title="Daily Canvas"></Header>
      <div className="h-96 pt-4 p-6">
        {data.length ? (
          <SVG
            src={latestCanvas.svg}
            width={CANVAS_SIZE * PIXEL_SIZE}
            height={CANVAS_SIZE * PIXEL_SIZE}
            className={"svgFix"}
          ></SVG>
        ) : null}
        <div className="flex flex-col">
          <div className="flex justify-center pb-2 pt-4 z-50">
            {data.length ? (
              <>
                <button onClick={handleRiffClick}>Edit Canvas</button>
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
              <Link href={`/canvas/${latestCanvas?.id}/view`}>
                <button>View Feed ({data.length} edits)</button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div />
  );
};

export default HomePage;
