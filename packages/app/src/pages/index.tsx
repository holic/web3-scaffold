import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { getSVG } from "@exquisite-graphics/js";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePixels } from "../components/usePixels";
import { dailyCanvasContract } from "../contracts";
import getPixelsFrom from "../utils/getPixelsFrom";

import PALETTES from "../constants/Palettes";

import Header from "../components/Header";
import { PIXEL_SIZE } from "../constants/Editor";
import { Pixels } from "../hooks/use-editor";
import { useDailyCanvasPrompt } from "../hooks/use-daily-canvas-prompt";

const DEFAULT_PALETTE = PALETTES[0];

const HomePage: NextPage = () => {
  const router = useRouter();

  // const [result, reexecuteQuery] = useDailies();
  const [canvasResult, reexecuteQuery] = useDailyCanvasPrompt({
    includeResponses: true,
  });
  const [riffLoading, setRiffLoading] = useState<boolean>(false);
  const [pixels, setPixels] = useState<Pixels | undefined>(undefined);

  const { data: dailyCanvas, fetching } = canvasResult;

  const { setPixels: setCanvasPixels } = usePixels({
    palette: dailyCanvas?.palette || DEFAULT_PALETTE,
  });

  const dailyCanvasReponses = dailyCanvas?.responses || [];
  const latestCanvasResponse =
    dailyCanvasReponses?.[dailyCanvasReponses.length - 1];

  const handleRiffClick = () => {
    setRiffLoading(true);
    try {
      setCanvasPixels(pixels || []);
      setTimeout(() => {
        router.push(`/canvas/${latestCanvasResponse?.id}/riff`);
      }, 600);
    } catch (e) {
      setRiffLoading(false);
    }
  };

  // @ts-ignore
  useEffect(() => {
    const fetchSVG = async () => {
      const dataRaw = await dailyCanvasContract.getCanvasPixels(
        String(latestCanvasResponse?.id)
      );
      const svgData = getSVG(dataRaw);
      console.log({ svgData });
      setPixels(getPixelsFrom(svgData));
    };
    if (latestCanvasResponse && latestCanvasResponse.id) {
      fetchSVG();
    }
  }, [latestCanvasResponse]);

  const handleHeaderClick = () => {
    // @ts-ignore
    reexecuteQuery({
      requestPolicy: "cache-and-network",
    });
  };

  if (canvasResult) {
    console.log({ promptResult: canvasResult });
  }

  return canvasResult && dailyCanvas && !fetching ? (
    <div className="flex flex-col h-screen w-full items-center text-white">
      <Header onClick={handleHeaderClick} title="Daily Canvas"></Header>
      <div className="h-96 pt-4 p-6">
        {latestCanvasResponse ? (
          <SVG
            src={latestCanvasResponse?.svg}
            width={Number(dailyCanvas.width) * PIXEL_SIZE}
            height={Number(dailyCanvas.height) * PIXEL_SIZE}
          ></SVG>
        ) : null}
        <div className="flex flex-col">
          <div className="flex justify-center pb-2 pt-4 z-50">
            {dailyCanvasReponses.length ? (
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
            {dailyCanvasReponses.length ? (
              <Link href={`/canvas/${latestCanvasResponse?.id}/view`}>
                <button>View Feed ({dailyCanvasReponses.length} edits)</button>
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
