/* eslint-disable @typescript-eslint/no-empty-function */

import React, { useState, useEffect, useMemo } from "react";
import useEditor, { Pixels, Tool } from "../../hooks/use-editor";
import {
  useNetwork,
  useContractWrite,
  useWaitForTransaction,
  useAccount,
  usePrepareContractWrite,
} from "wagmi";
import update from "immutability-helper";
import { defaultAbiCoder } from "ethers/lib/utils";
import { usePixels } from "../../components/usePixels";
import { useRouter } from "next/router";
import { DailyCanvas__factory } from "../../types";
import DailyCanvas from "@web3-scaffold/contracts/deploys/rinkeby/DailyCanvas.json";
import { switchChain } from "../../switchChain";
import { targetChainId } from "../../EthereumProviders";

import SVG from "react-inlinesvg";

import Button from "../../components/Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getActiveToolStyle } from "./utils";
import useCanvasResponse from "../../hooks/use-canvas-response";

interface EditorProps {
  riffId?: number;
  palette: string[];
  height: number;
  width: number;
}

const CONTRACT_SUBMITTING_LOADING_MESSAGE = "Submitting...";
const TRANSACTION_WAITING_LOADING_MESSAGE = "Confirming...";
const GRAPH_POLLING_LOADING_MESSAGE = "Finalizing...";

const Editor = ({ riffId, palette, height = 20, width = 20 }: EditorProps) => {
  const [drawing, setDrawing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number>();
  const [publishedCanvasId, setPublishedCanvasId] = useState<number>();

  const columns = useMemo(() => Array.from(Array(width).keys()), [width]);
  const rows = useMemo(() => Array.from(Array(height).keys()), [height]);

  const router = useRouter();
  const { connector: activeConnector } = useAccount();
  const { chain: activeChain } = useNetwork();

  const { openConnectModal } = useConnectModal();

  const {
    pixels,
    setPixels,
    undo,
    canUndo,
    getExquisiteData,
    resetPixels,
    emptyTile,
  } = usePixels({ palette, keySuffix: String(riffId) });

  const EMPTY = emptyTile;

  const {
    activeColor,
    setActiveColor,
    activeTool,
    prevTool,
    setActiveTool,
    getActiveCursor,
  } = useEditor({ palette });

  const paintNeighbors = (
    color: string,
    startColor: string,
    x: number,
    y: number,
    d: Pixels,
    checked: Record<string, boolean> = {}
  ) => {
    if (color == startColor) return d;
    if (x < 0 || x >= width) return d;
    if (y < 0 || y >= height) return d;

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
      if (EMPTY != undefined) {
        setPixels(EMPTY);

        setTimeout(() => {
          if (riffId) {
            router.push("/editor");
          }
        }, 600);
      }
    }
  };

  const handleBack = () => {
    if (
      confirm(
        "Are you sure you'd like to go back? Your current progress will be saved."
      )
    ) {
      router.push("/");
    }
  };

  const paintPixels = (rawX: number, rawY: number) => {
    const elem = document.elementFromPoint(rawX, rawY);
    if (!elem) return;
    if (!elem.getAttribute("class")?.includes("box")) return;

    // eslint-disable-next-line
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

  const [{ data: publishedCanvasResponse }] = useCanvasResponse(
    { canvasId: String(publishedCanvasId) },
    {
      pollingInterval,
      requestPolicy: "network-only",
    }
  );

  useEffect(() => {
    if (publishedCanvasResponse && publishedCanvasResponse?.id) {
      resetPixels();
      router.push(`/canvas/${publishedCanvasResponse.id}/view`);
    }
  }, [publishedCanvasResponse, router, resetPixels]);

  const { config: contractConfig } = usePrepareContractWrite({
    addressOrName: DailyCanvas.deployedTo,
    contractInterface: DailyCanvas__factory.abi,
    functionName: "drawCanvas",
    args: [getExquisiteData(), riffId ? riffId : 0],
  });

  const {
    data: contractData,
    write,
    isLoading: isLoadingWrite,
  } = useContractWrite(contractConfig);

  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      enabled: Boolean(contractData?.hash),
      confirmations: 1,
      hash: contractData?.hash,
      wait: contractData?.wait,
      onSuccess(contractData) {
        const event = defaultAbiCoder.decode(
          ["uint256", "bytes", "address", "uint256", "uint256"],
          contractData.logs[1].data
        );

        const canvasIdHex = event?.[0]?._hex;

        if (!canvasIdHex) return;
        const canvasId = Number(canvasIdHex);

        setPublishedCanvasId(canvasId);
        setPollingInterval(1000);
      },
    });

  const onMintPress = async () => {
    if (!activeConnector) {
      throw new Error("Wallet not connected");
    }

    await switchChain(activeConnector);

    write?.();
  };

  const isPollingForCanvas = isTransactionSuccess && !publishedCanvasResponse;

  const isLoading =
    isLoadingWrite || isTransactionLoading || isPollingForCanvas;

  const publishButtonLabel = useMemo(() => {
    if (isLoading && isLoadingWrite) {
      return CONTRACT_SUBMITTING_LOADING_MESSAGE;
    }
    if (isLoading && isTransactionLoading) {
      return TRANSACTION_WAITING_LOADING_MESSAGE;
    }
    if (isLoading && isPollingForCanvas && pollingInterval) {
      return GRAPH_POLLING_LOADING_MESSAGE;
    }

    if (activeChain?.id !== targetChainId) {
      return "Switch Chain";
    }

    return "Publish";
  }, [
    isLoading,
    isLoadingWrite,
    isTransactionLoading,
    isPollingForCanvas,
    pollingInterval,
    activeChain?.id,
  ]);

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
                  key={`${x}_${y}`}
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

      <div className={`color-palette pb-8 ${isLoading ? "opacity-60" : ""}`}>
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
      <div
        className={`color-palette-mini pb-8 ${isLoading ? "opacity-60" : ""}`}
      >
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
          {!activeConnector ? (
            <Button onClick={handleBack} className="bg-gray-500 text-white">
              Back
            </Button>
          ) : (
            <Button
              disabled={isLoading}
              onClick={handleClear}
              className="bg-gray-500 text-white"
            >
              Clear
            </Button>
          )}
        </div>
        <Button
          disabled={isLoading}
          className="bg-white text-black flex-1"
          onClick={activeConnector ? onMintPress : openConnectModal}
        >
          {activeConnector ? publishButtonLabel : "Connect to Publish"}
        </Button>
      </div>
      <style jsx>{`
        .canvas {
          display: grid;
          z-index: 100;
          grid-template-columns: repeat(${width}, 1fr);
          user-select: none;
          touch-action: none;
          cursor: ${getActiveCursor()};
          width: calc(${width} * 1rem);
          height: calc(${height} * 1rem);
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
          user-select: none;
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
          width: calc(${width} * 1rem);
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
          width: calc(${width} * 0.25rem);
          height: calc(${height} * 0.125rem);
          user-select: none;
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
          display: none;
          flex-direction: row;
          column-gap: 0px;
          flex-wrap: wrap;
          width: calc(5 * 4rem);
          user-select: none;
        }
        .color-palette div {
          position: relative;
          width: 2.5rem;
          height: 2.5rem;
          cursor: pointer;
          border: 1px solid #303030;
        }

        .color-palette-mini {
          display: flex;
          flex-direction: row;
          column-gap: 0px;
          width: calc(5 * 4rem);
          height: calc(4rem + 16px);
          overflow-x: auto;
          overflow-y: hidden;
          margin-bottom: 16px;
          scrollbar-color: #404040 #131313;
          user-select: none;
        }

        .color-palette-mini::-webkit-scrollbar {
          background-color: #131313;
          height: 8px;
        }

        .color-palette-mini::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 4px;
        }

        .color-palette-mini div {
          position: relative;
          width: 4rem;
          height: 4rem;
          cursor: pointer;
          flex-shrink: 0;
          border: 1px solid #303030;
        }

        .color-palette-mini-hidden {
          display: none !important;
        }

        @media (min-width: 768px) {
          .color-palette-mini {
            display: none;
          }

          .color-palette {
            display: flex;
          }
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
