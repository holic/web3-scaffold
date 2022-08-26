import type { NextPage } from "next";
import React, { useState, useMemo } from "react";
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
import { useDailyCanvasPrompts } from "../hooks/use-daily-canvas-prompts";
import Button from "../components/Button";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { CanvasResponse } from "../types/Daily";

const DEFAULT_PALETTE = PALETTES[0];

const HomePageScrollable: NextPage = () => {
  const router = useRouter();
  const [canvasResults, reexecuteQuery] = useDailyCanvasPrompts({
    includeResponses: true,
  });

  const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  const [riffLoading, setRiffLoading] = useState<boolean>(false);

  const { data: dailyCanvases, fetching } = canvasResults;
  console.log({ canvasResults, dailyCanvases });

  const dailyCanvasReponses = useMemo(() => {
    let responses: CanvasResponse[] = [];
    dailyCanvases?.forEach((dc) => {
      responses = [...responses, ...dc.responses];
    });

    return responses;
  }, [dailyCanvases]);

  const handleHeaderClick = () => {
    // @ts-ignore
    reexecuteQuery({
      requestPolicy: "cache-and-network",
    });
  };

  return canvasResults && dailyCanvases && !fetching ? (
    <div className="flex justify-center w-full text-white">
      <div className="canvas-grid">
        <div className="i">+</div>
        {dailyCanvasReponses.map((c, index) => (
          <div key={c.id + "canvas"}>
            <SVG src={c.svg} width={160} height={160}></SVG>
          </div>
        ))}
      </div>

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
          .i {
            height: 160px;
            width: 160px;
          }

          .canvas-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-column-gap: 4px;
            grid-row-gap: 4px;
            max-width: 488px;
            grid-auto-flow: dense;
            direction: rtl;
          }

          .canvas-grid-item {
            cursor: pointer;
          }
        `}
      </style>
      <Footer></Footer>
    </div>
  ) : (
    <div />
  );
};

export default HomePageScrollable;
