import React, { useState } from "react";
// import Button, { ButtonSuccess } from '@app/components/Button';
import useEditor, { Pixels, Tool } from "../hooks/use-editor";
import Icon from "./Icon";
// import EditorPreview from "./EditorPreview";
import update from "immutability-helper";
import { usePixels } from "../components/usePixels";
// import { getBinarySVG_2DArr } from "@exquisite-graphics/js";
import PALETTES from "../constants/Palettes";

import { toast } from "react-toastify";
import { useConnect } from "wagmi";

import { Button } from "../Button";
import { dailyCanvasContract, usedailyCanvasContractRead } from "../contracts";
import { switchChain } from "../switchChain";

interface EditorProps {
  x: number;
  y: number;
  closeModal: () => void;
  hideControls?: boolean;
  hideMinimap?: boolean;
  refreshCanvas?: () => void;
}

const MAX = 16;
const PIXEL_SIZE = 16;

const columns = Array.from(Array(MAX).keys());
const rows = Array.from(Array(MAX).keys());

type TilePeek = { offsetX: number; offsetY: number };
const peek: TilePeek[] = [];
for (let offsetY = -1; offsetY <= 1; offsetY++) {
  for (let offsetX = -1; offsetX <= 1; offsetX++) {
    if (offsetX === 0 && offsetY === 0) {
      // exclude the tile we're drawing
      continue;
    }
    peek.push({ offsetX, offsetY });
  }
}

const EMPTY: Pixels = columns.map(() => rows.map(() => PALETTES[0][0]));

const Editor = ({
  x,
  y,
  closeModal,
  hideControls,
  hideMinimap,
  refreshCanvas,
}: EditorProps) => {
  // usePixels(x, y);
  console.log("usePixels", "x", x, "y", y);
  const [drawing, setDrawing] = useState(false);

  const { pixels, setPixels, undo, canUndo, getExquisiteData } = usePixels(
    x,
    y
  );

  const { activeConnector } = useConnect();

  const {
    palette,
    activeColor,
    setActiveColor,
    activeTool,
    prevTool,
    setActiveTool,
    getActiveCursor,
  } = useEditor();

  const paintNeighbors = (
    color: string,
    startColor: string,
    x: number,
    y: number,
    d: Pixels,
    checked: Record<string, boolean> = {}
  ) => {
    if (color == startColor) return d;
    if (x < 0 || x >= MAX) return d;
    if (y < 0 || y >= MAX) return d;

    const key = `${x},${y}`;
    // If we've already checked this pixel don't check again
    if (checked[key]) return d;

    // if this is no longer the same color stop checking
    if (d[x][y] !== startColor) return d;

    // TODO: set up a linter to prevent mutating arguments?

    // paint this pixels color
    d = update(d, { [x]: { [y]: { $set: color } } });

    // paint each adjacent pixel
    d = paintNeighbors(color, startColor, x + 1, y, d, checked);
    d = paintNeighbors(color, startColor, x - 1, y, d, checked);
    d = paintNeighbors(color, startColor, x, y + 1, d, checked);
    d = paintNeighbors(color, startColor, x, y - 1, d, checked);

    // Since we've just checked this one, make sure we don't check it again
    checked[key] = true;

    return d;
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to erase your drawing?")) {
      setPixels(EMPTY);
    }
  };

  const paintPixels = (rawX: number, rawY: number) => {
    const elem = document.elementFromPoint(rawX, rawY);
    if (!elem) return;
    if (!elem.getAttribute("class")?.includes("box")) return;

    const [x, y] = elem
      .getAttribute("id")!
      .split("_")
      .map((n) => parseInt(n));

    if (activeTool == Tool.BRUSH) {
      elem.setAttribute("style", `background-color: ${activeColor}`);
      const newPixels = update(pixels, { [x]: { [y]: { $set: activeColor } } });
      setPixels(newPixels);
    } else if (activeTool == Tool.EYEDROPPER) {
      setActiveColor(pixels[x][y]);
      setActiveTool(prevTool);
    } else if (activeTool == Tool.BUCKET) {
      const newPixels = paintNeighbors(activeColor, pixels[x][y], x, y, pixels);
      setPixels(newPixels);
    }
  };

  // TODO: break these out into functions
  const touchEnter = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!drawing) return;
    e.preventDefault();

    paintPixels(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    x: number,
    y: number
  ) => {
    if (!drawing) return;
    e.preventDefault();

    paintPixels(e.clientX, e.clientY);
  };

  return (
    <div className="editor">
      <div
        className="canvas"
        draggable={false}
        onPointerDown={(e) => {
          setDrawing(true);
        }}
        onPointerUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
        onPointerLeave={() => setDrawing(false)}
      >
        {columns.map((y) => {
          return rows.map((x) => {
            return (
              <div
                id={`${x}_${y}`}
                key={`${x}_${y}`}
                className="box"
                style={{
                  // @ts-ignore
                  backgroundColor: palette[pixels?.[x]?.[y]],
                }}
                onPointerEnter={(e) => onMouseEnter(e, x, y)}
                onMouseDown={(e) => onMouseEnter(e, x, y)}
                onMouseOver={(e) => onMouseEnter(e, x, y)}
                onTouchMove={(e) => {
                  touchEnter(e);
                }}
                onTouchStart={(e) => {
                  touchEnter(e);
                }}
              ></div>
            );
          });
        })}
      </div>

      <div className="tool-container">
        <div className="toolbar">
          <button
            type="button"
            onClick={(e) => setActiveTool(Tool.BRUSH)}
            className={
              activeTool == Tool.BRUSH ? `active brush` : `` + " brush"
            }
          >
            brush
            {/* <Icon
                name="brush"
                style={{
                  width: "30px",
                  height: "auto",
                  fill: "#fff",
                }}
              /> */}
          </button>
          <button
            type="button"
            onClick={(e) => setActiveTool(Tool.BUCKET)}
            className={
              activeTool == Tool.BUCKET ? `active bucket` : `` + " bucket"
            }
          >
            bucket
            {/* <Icon
                name="bucket"
                style={{
                  width: "34px",
                  height: "auto",
                }}
              /> */}
          </button>
          <button
            type="button"
            onClick={(e) => setActiveTool(Tool.EYEDROPPER)}
            className={
              activeTool == Tool.EYEDROPPER
                ? `active eyedropper`
                : `` + " eyedropper"
            }
          >
            eyedropper
            {/* <Icon
                name="eyedropper"
                style={{
                  width: "22px",
                  height: "auto",
                }}
              /> */}
          </button>
          <button
            type="button"
            className="undo"
            disabled={!canUndo}
            onClick={undo}
          >
            undo
            {/* <Icon
                name="undo"
                style={{
                  width: "32px",
                  height: "auto",
                }}
              /> */}
          </button>
        </div>

        <div className="color-palette">
          {palette.map((color) => {
            return (
              <div
                key={`${color}`}
                className={color == activeColor ? "active" : ""}
                style={{
                  backgroundColor: color,
                }}
                onClick={(e) => setActiveColor(color)}
              ></div>
            );
          })}
        </div>
      </div>

      {!hideControls && (
        <div className="canvas-footer">
          <button onClick={handleClear}>Clear</button>
          <div className="canvas-footer-right">
            <button
              onClick={async () => {
                if (!activeConnector) {
                  throw new Error("Wallet not connected");
                }

                switchChain(activeConnector);
                const signer = await activeConnector.getSigner();
                const contract = dailyCanvasContract.connect(signer);
                const currentPromptId =
                  dailyCanvasContract.getCurrentPromptId();

                console.log("data", getExquisiteData());

                const data = getExquisiteData();
                console.log("sending data");
                // @ts-ignore
                contract.drawCanvas(data, currentPromptId);
              }}
            >
              mint
            </button>
            {/* <buttonSuccess onClick={onPublishClick}>
              <img src="/graphics/icon-mint.svg" className="mint" /> Mint
            </buttonSuccess> */}
          </div>
        </div>
      )}

      <style jsx>{`
        .canvas {
          display: grid;
          grid-template-columns: repeat(16, 1fr);
          width: ${rows.length * PIXEL_SIZE}px;
          height: ${columns.length * PIXEL_SIZE}px;
          user-select: none;
          touch-action: none;
          cursor: ${getActiveCursor()};
        }

        .box {
          width: ${PIXEL_SIZE + 4}px;
          height: ${PIXEL_SIZE + 4}px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-width: 0 1px 1px 0;
        }
        .box:hover {
          background-color: #777;
        }
        .box-preview {
          width: 3px;
          height: 3px;
        }

        .editor {
          display: flex;
          flex-direction: column;
          grid-template-columns: auto auto auto;
          grid-template-rows: auto;
          grid-template-areas:
            'aside-left canvas aside-right'
            'aside-left canvas-footer aside-right';
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          flex: 1 1 auto;
        }

        .canvas-footer {
          display: flex;
          padding: 0;
          align-items: center;
          justify-content: space-between;
          grid-area: canvas-footer;
          box-sizing: border-box;
          margin-top: 14px;
        }

        .canvas-footer-right {
          display: grid;
          grid-template-columns: 1fr 1fr;
          justify-content: stretch;
          gap: 8px;
        }

        .canvas-peek {
          width: ${PIXEL_SIZE * (MAX + 8)}px;
          height: ${PIXEL_SIZE * (MAX + 8)}px;
          padding: ${PIXEL_SIZE * 4}px;
          overflow: hidden;
          background: #333;
        }
        .canvas-neighbors {
          position relative;
        }
        .canvas-neighbors > img {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .preview-minimap {
          margin-left: 1rem;
          border: 4px solid #201e1e;
        }
        .preview-minimap > div {
          display: flex;
        }
        .preview {
          width: 96px;
          height: 96px;
          image-rendering: pixelated;
          display: grid;
          grid-template-columns: repeat(32, 1fr);
          background: #fff;
        }

        .tool-container {
          background: #201e1e;
          margin-top: 64px;
        }

        .toolbar {
          display: flex;
          flex-direction: row;
        }

        .toolbar button {
          padding: 10px 12px;
          background: transparent;
          outline: none;
          border: none;
          opacity: 0.5;
          cursor: pointer;
        }
        .toolbar button:hover:not([disabled]) {
          background: #1b1919;
          opacity: 0.9;
        }
        .toolbar button[disabled] {
          cursor: not-allowed;
          opacity: 0.2;
        }
        .toolbar button.active {
          opacity: 1;
          background: #1b1919;
        }

        .brush,
        .bucket,
        .eyedropper,
        .undo {
          fill: #fff;
        }

        .undo:disabled:hover {
          cursor: pointer;
        }

        .color-palette {
          display: flex;
          flex-direction: row;
          grid-template-columns: 50% 50%;
          grid-gap: 1px;
          column-gap: 0px;
        }

        .color-palette div {
          position: relative;
          width: 28px;
          height: 28px;
          cursor: pointer;
        }

        .color-palette .active::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
          width: 8px;
          height: 8px;
          background: #000;
        }
        .mint {
          width: 16px;
          margin-top: 3px;
          margin-right: 6px;
        }

        @media (max-width: 768px) {
          .canvas {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Editor;
