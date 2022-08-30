import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import SVG from "react-inlinesvg";
// import { useRouter } from "next/router";

// import { Pixels } from "../hooks/use-editor";
import { useDailyCanvasPrompts } from "../hooks/use-daily-canvas-prompts";
import Footer from "../components/Footer";
import { CanvasResponse } from "../types/Daily";

const COLUMN_COUNT = 3;
const calc = (totalTiles: number) => COLUMN_COUNT - (totalTiles % COLUMN_COUNT);

const HomePageScrollable: NextPage = () => {
  // const router = useRouter();
  const [canvasResults] = useDailyCanvasPrompts({
    includeResponses: true,
  });
  const [SelectedTile, setSelectedTile] = useState<string>("");
  const [siblingTiles, setSiblingTiles] = useState({
    top: "",
    topLeft: "",
    left: "",
    right: "",
    topRight: "",
    bottom: "",
    bottomLeft: "",
    bottomRight: "",
  });
  const [gridTiles, setGridTiles] = useState<string[]>([]);

  console.log(siblingTiles);
  // const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  // const [riffLoading, setRiffLoading] = useState<boolean>(false);

  const { data: dailyCanvases, fetching } = canvasResults;

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
      <div key={Math.random()} className="flex h-40 w-40 opacity-0">
        +
      </div>
    ));
  }, [dailyCanvasResponses]);

  console.log(dailyCanvasResponses.length);

  // if tile is in the left / center / right positon
  // idsOfGrid = [tileIndex - 3, tileIndex - 2, tileIndex - 1, tileIndex, tileIndex + 1, tileIndex + 2, tileIndex + 3, tileIndex + 4, tileIndex + 5].reverse();

  // center
  // idsOfGrid = [tileIndex - 4, tileIndex - 3, tileIndex - 2, tileIndex - 1, tileIndex, tileIndex + 1, tileIndex + 2, tileIndex + 3, tileIndex + 4].reverse();
  // if the tile

  // calculate sibling tile index values from array of objects on 3-column grid
  useEffect(() => {
    const totalTiles = dailyCanvasResponses.length;
    // const columnCount = calc(totalTiles);
    const columnCount = COLUMN_COUNT;
    const rowCount = Math.ceil(totalTiles / columnCount);
    const selectedTileIndex = dailyCanvasResponses.findIndex(
      (canvasPrompt) => canvasPrompt.id === SelectedTile
    );
    const selectedTileRow = Math.floor(selectedTileIndex / columnCount);
    const selectedTileColumn = selectedTileIndex % columnCount;
    const siblingTilesIndex = {
      top: dailyCanvasResponses[selectedTileIndex - columnCount]?.id || "",
      topRight:
        dailyCanvasResponses[selectedTileIndex - columnCount - 1]?.id || "",
      right: dailyCanvasResponses[selectedTileIndex - 1]?.id || "",
      left:
        selectedTileColumn == 0 || selectedTileColumn == 2
          ? dailyCanvasResponses[selectedTileIndex + 1]?.id || ""
          : "",
      topLeft:
        dailyCanvasResponses[selectedTileIndex - columnCount + 1]?.id || "",
      bottom: dailyCanvasResponses[selectedTileIndex + columnCount]?.id || "",
      bottomRight:
        dailyCanvasResponses[selectedTileIndex + columnCount - 1]?.id || "",
      bottomLeft:
        dailyCanvasResponses[selectedTileIndex + columnCount + 1]?.id || "",
    };

    setSiblingTiles(siblingTilesIndex);

    // derive range of ids of row as well as rows above and below in 3-column grid

    let selectedTileIndexCenter;
    // selectedTileIndex += 1;

    if (selectedTileColumn == 1) {
      selectedTileIndexCenter = selectedTileIndex;
    } else if (selectedTileColumn == 0) {
      selectedTileIndexCenter = selectedTileIndex + 1;
    } else {
      selectedTileIndexCenter = selectedTileIndex;
    }

    const ids = dailyCanvasResponses.slice(
      selectedTileIndexCenter - 4,
      selectedTileIndexCenter + 4
    );
    setGridTiles(ids.map((response) => response.id).sort());

    // 376 - 3 = 373 + 0 = 373 = topLeft
    // gridTiles.push(
    //     dailyCanvasResponses[
    //       selectedTileIndex - (columnCount + selectedTileColumn)
    //     ]
    //   );
    //   gridTiles
    //     .push
    //     // dailyCanvasResponses[selectedTileIndex - (columnCount - 1 + selectedCol)]
    //     ();
    //   gridTiles.push(dailyCanvasResponses[selectedTileIndex - columnCount - 2]);
    //   gridTiles.push(dailyCanvasResponses[selectedTileIndex]);
    //   gridTiles.push(dailyCanvasResponses[selectedTileIndex + columnCount]);
    //   gridTiles.push(dailyCanvasResponses[selectedTileIndex + columnCount + 1]);
    //   gridTiles.push(dailyCanvasResponses[selectedTileIndex + columnCount + 2]);
  }, [dailyCanvasResponses, SelectedTile]);

  const siblingTilesReversed = Object.fromEntries(
    Object.entries(siblingTiles).map(([key, value]) => [value, key])
  );
  console.log("reversed", siblingTilesReversed);
  console.log("grid", gridTiles);

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
        {dailyCanvasResponses.map((c) => (
          <button
            style={{
              position: "relative",
              opacity: gridTiles.includes(c.id) ? "0.1" : "1",
            }}
            onClick={() => {
              setSelectedTile(c.id);
            }}
            key={c.id + "canvas"}
          >
            <span
              style={{
                backgroundColor: "black",
                color: "white",
                position: "absolute",
              }}
            >
              {/* ts-ignore */}
              {c.id}
            </span>
            <SVG src={c.svg} width={160} height={160}></SVG>
          </button>
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
