import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import SVG from "react-inlinesvg";
import Link from "next/link";
import Button from "../../../components/Button";
import { getSVG } from "@exquisite-graphics/js";
import { dailyCanvasContract } from "../../../contracts";
import Header from "../../../components/Header";
import { usePixels } from "../../../components/usePixels";
import getPixelsFrom from "../../../utils/getPixelsFrom";
import { Pixels } from "../../../hooks/use-editor";
import { PIXEL_SIZE } from "../../../constants/Editor";
import PALETTES from "../../../constants/Palettes";
import useCanvasResponse from "../../../hooks/use-canvas-response";
import useKeyPress from "../../../hooks/use-keypress";
import { useENS } from "../../../useENS";
import { CanvasResponse } from "../../../types/Daily";
import Footer from "../../../components/Footer";

const CanvasViewQuery = `query IndividualCanvasQuery($canvasId: ID) {
  canvasResponses(where: {id: $canvasId}) {
    id
    author
    svg
    tokenURI
    prompt {
      id
      palette
      height
      width
      responses { 
        id
      }
    }
    riffCanvasId
  }
}
`;

const CanvasViewPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [
    {
      data: currentCanvas,
      fetching: currentCanvasFetching,
      error: currentCanvasError,
    },
  ] = useCanvasResponse(
    {
      canvasId: String(id),
    },
    {
      query: CanvasViewQuery,
    }
  );

  useEffect(() => {
    if (!currentCanvasFetching && (!currentCanvas || currentCanvasError)) {
      toast(`Canvas ${!id ? "" : `#${id}`} not found`);
      router.push("/");
    }
  }, [currentCanvasFetching, currentCanvas, currentCanvasError, id, router]);

  const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  const [riffLoading, setRiffLoading] = useState<boolean>(false);

  const { pixelsHistory, replacePixels } = usePixels({
    keySuffix: String(id),
    palette: currentCanvas?.prompt?.palette || PALETTES[0],
  });

  const allDailyCanvases = currentCanvas?.prompt.responses;

  const handleRiffClick = () => {
    setRiffLoading(true);
    try {
      if (!pixels?.length && !pixelsHistory?.length) {
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
        router.push(`/canvas/${id}/riff`);
      }, 600);
    } catch (e) {
      setRiffLoading(false);
    }
  };

  const nextCanvas = useMemo(
    () =>
      allDailyCanvases?.find(
        (x: CanvasResponse) => Number(x.id) === Number(id) + 1
      ) || null,
    [allDailyCanvases, id]
  );
  const previousCanvas = useMemo(
    () =>
      allDailyCanvases?.find(
        (x: CanvasResponse) => Number(x.id) === Number(id) - 1
      ) || null,
    [allDailyCanvases, id]
  );

  useEffect(() => {
    const fetchSVG = async () => {
      // const svgData = await dailyCanvasContract.getTileSVG(String(id));

      const dataRaw = await dailyCanvasContract.getCanvasPixels(String(id));
      const svgData = getSVG(dataRaw);

      // If history based on riffId in localstorage is only one, then we can safely
      // reset it to the svgData, otherwise there is riff history and we shouldn't overwrite
      setPixels(getPixelsFrom(svgData));
    };
    if (id) {
      fetchSVG();
    }
  }, [id]);

  const ens = useENS(currentCanvas?.author || "");

  useKeyPress(["ArrowLeft"], () => {
    if (previousCanvas) {
      router.push(`/canvas/${previousCanvas.id}/view`);
    }
  });

  useKeyPress(["ArrowRight"], () => {
    if (nextCanvas) {
      router.push(`/canvas/${nextCanvas.id}/view`);
    }
  });

  return currentCanvas ? (
    <div className="flex flex-col h-full w-full items-center overflow-hidden">
      <div className="flex-1" />
      <div className="flex-1 canvas-fix">
        <Header title="Daily Canvas" className="pb-4"></Header>
        <SVG
          src={currentCanvas.svg}
          width={Number(currentCanvas.prompt.width) * PIXEL_SIZE}
          height={Number(currentCanvas.prompt.height) * PIXEL_SIZE}
        ></SVG>
        <div className="flex flex-col h-full">
          <div className="w-full flex flex-row justify-between my-2 font-mono text-white ">
            <Link
              href={previousCanvas ? `/canvas/${previousCanvas.id}/view` : ""}
            >
              <button
                disabled={!previousCanvas}
                className="disabled:opacity-30"
              >
                ⬅️ prev
              </button>
            </Link>

            <div className="flex flex-col items-center align-middle">
              <Link
                href={`https://rinkeby.etherscan.io/address/${currentCanvas?.author}`}
              >
                <span className="cursor-pointer">
                  {ens?.displayName || currentCanvas?.author?.slice(-6)}
                </span>
              </Link>
            </div>

            <Link href={nextCanvas ? `/canvas/${nextCanvas.id}/view` : ""}>
              <button disabled={!nextCanvas} className="disabled:opacity-30">
                next ➡️
              </button>
            </Link>
          </div>
          <div className="flex justify-center pt-8">
            <Button
              onClick={handleRiffClick}
              disabled={
                riffLoading || !pixels?.length || !pixelsHistory?.length
              }
              className="h-12 w-48"
            >
              <span>{riffLoading ? "Loading Riff..." : "Riff"}</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-[2]" />
      <style jsx>
        {`
          .canvas-fix {
            margin-bottom: 104px;
          }
          @media (min-width: 768px) {
            .canvas-fix {
              margin-bottom: calc(12rem + 8px);
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

export default CanvasViewPage;
