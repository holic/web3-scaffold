import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { getSVG } from "@exquisite-graphics/js";
import { useRouter } from "next/router";
import { usePixels } from "../components/usePixels";
import { dailyCanvasContract } from "../contracts";
import getPixelsFrom from "../utils/getPixelsFrom";

import PALETTES from "../constants/Palettes";

import Header from "../components/Header";
import { PIXEL_SIZE } from "../constants/Editor";
import { Pixels } from "../hooks/use-editor";
import { useDailyCanvasPrompt } from "../hooks/use-daily-canvas-prompt";
import Button from "../components/Button";
import Footer from "../components/Footer";

const DEFAULT_PALETTE = PALETTES[0];

const HomePage: NextPage = () => {
  const router = useRouter();
  const [canvasResult, reexecuteQuery] = useDailyCanvasPrompt({
    includeResponses: true,
  });
  const [pixels, setPixels] = useState<Pixels | undefined>(undefined);

  const { data: dailyCanvas, fetching } = canvasResult;

  const { setPixels: setCanvasPixels } = usePixels({
    palette: dailyCanvas?.palette || DEFAULT_PALETTE,
  });

  const dailyCanvasReponses = dailyCanvas?.responses || [];
  const latestCanvasResponse =
    dailyCanvasReponses?.[dailyCanvasReponses.length - 1];

  const handleRiffClick = () => {
    setCanvasPixels(pixels || []);
    setTimeout(() => {
      router.push(`/canvas/${latestCanvasResponse?.id}/riff`);
    }, 600);
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
    <div className="flex flex-col h-full w-full items-center text-white xs:pt-8 sm:pt-24 md:pt-40 lg:pt-64 pt-24">
      <Header onClick={handleHeaderClick} title="Daily Canvas"></Header>
      <div className="h-96 pt-6 mb">
        {latestCanvasResponse ? (
          <SVG
            src={latestCanvasResponse?.svg}
            width={Number(dailyCanvas.width) * PIXEL_SIZE}
            height={Number(dailyCanvas.height) * PIXEL_SIZE}
          ></SVG>
        ) : null}
        <div className="flex flex-col pt-6">
          <div className="flex justify-center z-50 pb-2">
            {dailyCanvasReponses.length ? (
              <>
                <Button className="text-black w-40" onClick={handleRiffClick}>
                  Edit Canvas
                </Button>
              </>
            ) : (
              <>
                <Button className="text-black w-40" href="/editor">
                  <button>Edit Canvas</button>
                </Button>
              </>
            )}
          </div>
          <div className="flex justify-center z-50">
            {dailyCanvasReponses.length ? (
              <Button
                className="text-white button-secondary w-40"
                href={`/canvas/${latestCanvasResponse?.id}/view`}
              >
                View Feed
              </Button>
            ) : null}
          </div>

          <div className="flex justify-center pt-6">
            <p>{dailyCanvasReponses.length} edits today</p>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  ) : (
    <div />
  );
};

export default HomePage;
