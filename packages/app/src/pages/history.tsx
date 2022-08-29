import type { NextPage } from "next";
import React, { useState, useMemo } from "react";
import SVG from "react-inlinesvg";
// import { useRouter } from "next/router";

import { Pixels } from "../hooks/use-editor";
import { useDailyCanvasPrompts } from "../hooks/use-daily-canvas-prompts";
import Footer from "../components/Footer";
import { CanvasResponse } from "../types/Daily";

const calc = (num: number) => {
  const initial = Math.floor(((1 - (num / 3 - Math.floor(num / 3))) / 3) * 10);

  return initial;
};

const HomePageScrollable: NextPage = () => {
  // const router = useRouter();
  const [canvasResults] = useDailyCanvasPrompts({
    includeResponses: true,
  });

  // const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  // const [riffLoading, setRiffLoading] = useState<boolean>(false);

  const { data: dailyCanvases, fetching } = canvasResults;

  const dailyCanvasReponses = useMemo(() => {
    let responses: CanvasResponse[] = [];
    dailyCanvases?.forEach((dc) => {
      responses = [...responses, ...dc.responses];
    });

    return responses;
  }, [dailyCanvases]);

  const renderAdditionalTilesArray = useMemo(() => {
    // Build array and remove one to leave room for button
    return [...Array(calc(dailyCanvasReponses.length || 1) - 1)].map(() => (
      <div key={Math.random()} className="flex h-40 w-40 opacity-0">
        +
      </div>
    ));
  }, [dailyCanvasReponses]);

  return canvasResults && dailyCanvases && !fetching ? (
    <div className="flex justify-center w-full text-white pt-4">
      <div className="flex-grid">
        {renderAdditionalTilesArray}
        <div
          key={Math.random()}
          className="flex h-40 w-40 bg-stone-700 justify-center items-center text-6xl"
        >
          +
        </div>
        {dailyCanvasReponses.map((c) => (
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

          .flex-grid {
            gap: 4px;
            display: flex;
            flex-flow: row-reverse wrap;
            align-items: flex-end;
            justify-content: flex-end;
            width: 488px;
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
