import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import SVG from "react-inlinesvg";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import Countdown from "../components/Countdown";
import { useEnsStore } from "../useENS";

// import { Pixels } from "../hooks/use-editor";
import { useDailyCanvasPrompts } from "../hooks/use-daily-canvas-prompts";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { CanvasResponse } from "../types/Daily";

const COLUMN_COUNT = 3;
const calc = (totalTiles: number) => COLUMN_COUNT - (totalTiles % COLUMN_COUNT);

const HomePageScrollable: NextPage = () => {
  const router = useRouter();
  const [canvasResults] = useDailyCanvasPrompts({
    includeResponses: true,
  });

  const ensNames = useEnsStore((state) => state.resolvedAddresses);

  // const [SelectedTile, setSelectedTile] = useState<string>("");
  // const [gridTiles, setGridTiles] = useState<string[]>([]);

  // const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  // const [riffLoading, setRiffLoading] = useState<boolean>(false);

  const { data: dailyCanvases, fetching } = canvasResults;

  const handleTileClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // setSelectedTile(event.currentTarget.name);
    if (!event.currentTarget?.name) return;

    router.push(`/canvas/${event.currentTarget.name}/view`);
  };

  const dailyCanvasResponses = useMemo(() => {
    let responses: CanvasResponse[] = [];
    dailyCanvases?.forEach((dc) => {
      responses = [...responses, ...dc.responses];
    });

    return responses;
  }, [dailyCanvases]);

  const renderAdditionalTilesArray = useMemo(() => {
    // Build array and remove one to leave room for button
    return [...Array(calc(dailyCanvasResponses.length || 1) - 1)].map(() => (
      <div key={Math.random()} className="flex h-[120px] w-[120px] opacity-0">
        +
      </div>
    ));
  }, [dailyCanvasResponses]);

  // useEffect(() => {
  //   const selectedTileIndex = dailyCanvasResponses.findIndex(
  //     (canvasPrompt) => canvasPrompt.id === SelectedTile
  //   );
  //   const selectedTileColumn = selectedTileIndex % COLUMN_COUNT;
  //
  //   // Regardless of which column you click, we reference the center tile
  //   // in the clicked row.
  //   //
  //   // [2, 1, 0]
  //   // [2, 1, 0]
  //   // [2, 1, 0]
  //   //
  //   // Example: Clicking column 2, will subtract 1 to center to 1,
  //   // Clicking column 1 will add 1 to center to 1.
  //   let selectedTileIndexCenter;
  //   if (selectedTileColumn == 2) {
  //     selectedTileIndexCenter = selectedTileIndex - 1;
  //   } else if (selectedTileColumn == 0) {
  //     selectedTileIndexCenter = selectedTileIndex + 1;
  //   } else {
  //     selectedTileIndexCenter = selectedTileIndex;
  //   }
  //
  //   // Adds offsets based on column count
  //   const ids = dailyCanvasResponses.slice(
  //     selectedTileIndexCenter - (COLUMN_COUNT + Math.floor(COLUMN_COUNT / 2)),
  //     selectedTileIndexCenter + (COLUMN_COUNT + Math.ceil(COLUMN_COUNT / 2))
  //   );

  //   const tiles = ids.map((response) => response.id).sort();
  //   setGridTiles(tiles);
  // }, [dailyCanvasResponses, SelectedTile]);

  return (
    <div className="flex justify-center w-full text-white">
      <Header title="The Scroll" className="fixed" />
      {canvasResults && dailyCanvases && !fetching ? (
        <>
          <div className="fixed bottom-0 p-5 z-50 text-lg w-[360px] text-center font-mono bg-gradient-to-t from-[#131313] to-background-opacity-0">
            <Countdown />
          </div>
          <div className="mt-32 flex flex-row-reverse	justify-end items-end	flex-wrap min-w-[360px] max-w-[360px]">
            {renderAdditionalTilesArray}
            <Link href="/editor">
              <div
                key={Math.random()}
                className="flex h-[120px] w-[120px] animate-pulse cursor-pointer bg-stone-700 justify-center items-center text-6xl"
              >
                +
              </div>
            </Link>
            {dailyCanvasResponses.map((c) => (
              <button
                className="relative flex justify-center items-end"
                onClick={handleTileClick}
                name={c.id}
                key={c.id + "canvas"}
              >
                <div
                  className="absolute flex justify-center items-end p-2 show-on-hover bg-gradient-to-t from-[#131313] to-background-opacity-0"
                  style={{ height: 120, width: 120 }}
                >
                  <span className="white text-xs">
                    {ensNames[c?.author?.toLowerCase()]?.name ||
                      c.author.slice(-6)}
                  </span>
                </div>
                <SVG src={c.svg} width={120} height={120}></SVG>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-48">
          <Image
            alt="Loader"
            src="/loading.gif"
            height="100"
            width="100"
          ></Image>
        </div>
      )}
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

          .show-on-hover {
            opacity: 0;
          }

          div.show-on-hover-parent + .show-on-hover {
          }

          div.show-on-hover:hover {
            opacity: 1;
          }
        `}
      </style>
      <Footer></Footer>
    </div>
  );
};

export default HomePageScrollable;
