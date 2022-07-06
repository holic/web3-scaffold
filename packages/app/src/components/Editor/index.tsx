/* eslint-disable @typescript-eslint/no-empty-function */

import React, { useState } from "react";
import useEditor, { Pixels, Tool } from "../../hooks/use-editor";
import { useConnect, useContractWrite, useWaitForTransaction } from "wagmi";
import update from "immutability-helper";
import { defaultAbiCoder } from "ethers/lib/utils";
import { usePixels } from "../../components/usePixels";
import PALETTES from "../../constants/Palettes";
import { useRouter } from "next/router";
import { dailyCanvasContract } from "../../contracts";
import { DailyCanvas__factory } from "../../types";
import DailyCanvas from "@web3-scaffold/contracts/deploys/rinkeby/DailyCanvas.json";

import SVG from "react-inlinesvg";

import Button from "../../components/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CANVAS_SIZE } from "../../constants/Editor";

import { getActiveToolStyle } from "./utils";

interface EditorProps {
  riffId?: number;
}

const columns = Array.from(Array(CANVAS_SIZE).keys());
const rows = Array.from(Array(CANVAS_SIZE).keys());

const EMPTY: Pixels = columns.map(() => rows.map(() => PALETTES[0][0]));

const Editor = ({ riffId }: EditorProps) => {
  // const toastId = useRef(null);

  const [drawing, setDrawing] = useState(false);

  const router = useRouter();

  const { pixels, setPixels, undo, canUndo, getExquisiteData, resetPixels } =
    usePixels(riffId ? { keySuffix: String(riffId) } : {});

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
    if (x < 0 || x >= CANVAS_SIZE) return d;
    if (y < 0 || y >= CANVAS_SIZE) return d;

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
    if (!riffId && confirm("Are you sure you want to erase your drawing?")) {
      setPixels(EMPTY);
    }

    if (
      riffId &&
      confirm(
        "Are you sure you want to erase your drawing and clear your riff history? You will sent to the editor if you clear this riff."
      )
    ) {
      resetPixels();
      setTimeout(() => {
        if (riffId) {
          router.push("/editor");
        }
      }, 600);
    }
  };

  const paintPixels = (rawX: number, rawY: number) => {
    console.log({ rawX, rawY });
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

  const touchEnter = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!drawing) return;
    e.preventDefault();

    paintPixels(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawing) return;
    e.preventDefault();

    paintPixels(e.clientX, e.clientY);
  };

  const {
    data,
    write,
    isLoading: isLoadingWrite,
  } = useContractWrite(
    {
      addressOrName: DailyCanvas.deployedTo,
      contractInterface: DailyCanvas__factory.abi,
    },
    "drawCanvas"
  );

  const { isLoading: isTransactionLoading } = useWaitForTransaction({
    enabled: Boolean(data?.hash),
    confirmations: 2,
    hash: data?.hash,
    wait: data?.wait,
    onSuccess(data) {
      const event = defaultAbiCoder.decode(
        ["uint256", "bytes", "address", "uint256", "uint256"],
        data.logs[1].data
      );

      const canvasIdHex = event?.[0]?._hex;

      if (!canvasIdHex) return;
      const canvasId = Number(canvasIdHex);

      resetPixels();

      router.push(`/canvas/${canvasId}/view`);
    },
  });

  const onMintPress = async () => {
    if (!activeConnector) {
      throw new Error("Wallet not connected");
    }

    write({
      args: [
        getExquisiteData(),
        dailyCanvasContract.getCurrentPromptId(),
        riffId ? riffId : 0,
      ],
    });
  };

  const isLoading = isLoadingWrite || isTransactionLoading;

  console.log(pixels);

  return (
    <div className="flex flex-col">
      <div className="editor">
        <div
          className="canvas bg-white"
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
                  // Probably overkill, but we're getting key conflicts and bad-rerenders by using just x_y
                  key={`${x * Math.random()}_${y * Math.random()}`}
                  className={`box ${isLoading && "box-disabled"}`}
                  style={{
                    // @ts-ignore
                    backgroundColor: pixels?.[x]?.[y],
                  }}
                  onPointerEnter={!isLoading ? onMouseEnter : () => {}}
                  onMouseDown={!isLoading ? onMouseEnter : () => {}}
                  onMouseOver={!isLoading ? onMouseEnter : () => {}}
                  onTouchMove={!isLoading ? touchEnter : () => {}}
                  onTouchStart={!isLoading ? touchEnter : () => {}}
                ></div>
              );
            });
          })}
        </div>
      </div>

      {/* {riffId && riffId > 0 && (
        <>
          <p className="text-white -mt-6 justify-center flex">
            riffing on canvas {riffId}
          </p>
          <p className="text-xs text-white justify-center flex pb-4">
            press clear to reset
          </p>
        </>
      )} */}
      <div className={`toolbar ${isLoading && "opacity-60"}`}>
        <button
          disabled={isLoading}
          className={`flex toolbar-button justify-center items-center text-white fill-current`}
          onClick={() => setActiveTool(Tool.BRUSH)}
        >
          <SVG
            className={`toolbar-icon ${getActiveToolStyle(
              activeTool,
              Tool.BRUSH
            )}`}
            height={20}
            width={20}
            src={`/static/px-icon-pencil.svg`}
          ></SVG>
        </button>
        <button
          disabled={isLoading}
          className={`flex toolbar-button justify-center items-center text-white fill-current`}
          onClick={() => setActiveTool(Tool.BUCKET)}
        >
          <SVG
            className={`toolbar-icon ${getActiveToolStyle(
              activeTool,
              Tool.BUCKET
            )}`}
            height={20}
            width={20}
            src={`/static/px-icon-bucket.svg`}
          ></SVG>
        </button>
        <button
          className={`flex toolbar-button justify-center items-center text-white fill-current`}
          onClick={() => setActiveTool(Tool.EYEDROPPER)}
        >
          <SVG
            className={`toolbar-icon ${getActiveToolStyle(
              activeTool,
              Tool.EYEDROPPER
            )}`}
            height={20}
            width={20}
            src={`/static/px-icon-eyedropper.svg`}
          ></SVG>
        </button>
        <button
          className={`flex toolbar-button justify-center items-center text-white fill-current`}
          onClick={undo}
          disabled={!canUndo || isLoading}
        >
          <SVG
            className="toolbar-icon opacity-40"
            height={20}
            width={20}
            src="/static/px-icon-undo.svg"
          ></SVG>
        </button>
      </div>

      <div className={`color-palette pb-8 ${isLoading && "opacity-60"}`}>
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

      <div className="flex flex-row h-12">
        <div className="flex-2 mr-1">
          <Button
            disabled={isLoading}
            onClick={handleClear}
            className="bg-gray-500 text-white"
          >
            Clear
          </Button>
        </div>
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <Button
              disabled={isLoading}
              className="bg-white text-black flex-1"
              onClick={activeConnector ? onMintPress : openConnectModal}
            >
              {activeConnector ? "Publish" : "Connect to Publish"}
            </Button>
          )}
        </ConnectButton.Custom>
      </div>
      <style jsx>{`
        .canvas {
          display: grid;
          z-index: 100;
          grid-template-columns: repeat(${CANVAS_SIZE}, 1fr);
          user-select: none;
          touch-action: none;
          cursor: ${getActiveCursor()};
          width: calc(${CANVAS_SIZE} * 1rem);
          height: calc(${CANVAS_SIZE} * 1rem);
        }

        .box {
          width: 1rem;
          height: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-width: 1px 1px 1px 1px;
        }
        .box-disabled {
          border: unset;
        }
        .box:hover {
          background-color: #777;
        }
        .box-preview {
          width: 3px;
          height: 3px;
        }

        .editor {
          padding-bottom: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
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

        .toolbar {
          display: flex;
          flex-direction: row;
          width: calc(${CANVAS_SIZE} * 1rem);
        }

        .icon-active {
          fill: white;
        }

        .toolbar-icon {
          fill: #767575;
        }

        .toolbar-button {
          background-color: #1b1919;
          border: 1px solid #404040;
          width: calc(${CANVAS_SIZE} * 0.25rem);
          height: calc(${CANVAS_SIZE} * 0.125rem);
        }

        .brush,
        .bucket,
        .eyedropper,
        .undo {
          fill: white;
        }

        .undo:disabled:hover {
          cursor: pointer;
        }

        .color-palette {
          display: flex;
          flex-direction: row;
          column-gap: 0px;
          flex-wrap: wrap;
          width: calc(5 * 4rem);
        }

        .color-palette div {
          position: relative;
          width: 3.331rem;
          height: 3.331rem;
          cursor: pointer;
          border: 1px solid #303030;
        }

        .mint {
          /* identical to box height */
          background-color: black;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Editor;
