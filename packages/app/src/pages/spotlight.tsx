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
import { toast } from "react-toastify";

const DEFAULT_PALETTE = PALETTES[0];

const HomePage: NextPage = () => {
  const router = useRouter();
  const [canvasResult, reexecuteQuery] = useDailyCanvasPrompt({
    includeResponses: true,
  });
  const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  const [riffLoading, setRiffLoading] = useState<boolean>(false);

  const { data: dailyCanvas, fetching } = canvasResult;

  const dailyCanvasReponses = dailyCanvas?.responses || [];
  const latestCanvasResponse =
    dailyCanvasReponses?.[dailyCanvasReponses.length - 1];

  const { pixelsHistory, replacePixels } = usePixels({
    palette: dailyCanvas?.palette || DEFAULT_PALETTE,
    keySuffix: latestCanvasResponse?.id,
  });

  const handleRiffClick = () => {
    if (!latestCanvasResponse?.id) return;

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

  return canvasResult && dailyCanvas && !fetching ? (
    <div className="flex flex-col h-full w-full items-center text-white overflow-hidden">
      <Header
        onClick={handleHeaderClick}
        title="The Scroll"
        className="pb-4"
      ></Header>
      <div className="flex-1" />
      <div className="flex-1 canvas-fix">
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
                <Button
                  className="text-black w-40"
                  disabled={riffLoading}
                  onClick={handleRiffClick}
                >
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
      <div className="flex-[2]" />

      <style jsx>
        {`
          .canvas-fix {
            margin-bottom: 48px;
          }
          @media (min-width: 768px) {
            .canvas-fix {
              margin-bottom: 144px;
            }
          }
        `}
      </style>
      <Footer></Footer>
    </div>
  ) : (
    <div />
  );
};

export default HomePage;
