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
import useDailyCanvasPrompt from "../../../hooks/use-daily-canvas-prompt";
import { formatRelative } from "date-fns";

const CanvasViewQuery = `query IndividualCanvasQuery($canvasId: ID) {
  canvasResponses(where: {id: $canvasId}) {
    id
    author
    svg
    tokenURI
    createdAt
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

  const [canvasPromptResult] = useDailyCanvasPrompt();
  const latestCanvasPromptId = canvasPromptResult?.data?.id;
  const dateString = useMemo(() => {
    if (!currentCanvas?.createdAt) return "";

    const string = formatRelative(
      new Date(Number(currentCanvas.createdAt) * 1000),
      new Date()
    );

    // if (string.includes("today")) return " ";

    return string.split(" at ")[0];
  }, [currentCanvas]);

  useEffect(() => {
    if (!currentCanvasFetching && (!currentCanvas || currentCanvasError)) {
      toast(`Canvas ${!id ? "" : `#${id}`} not found`);
      console.log({ currentCanvasError });
      router.push("/");
    }
  }, [currentCanvasFetching, currentCanvas, currentCanvasError, id, router]);

  const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  const [riffLoading, setRiffLoading] = useState<boolean>(false);

  const { pixelsHistory, replacePixels } = usePixels({
    keySuffix: String(id),
    palette: currentCanvas?.prompt?.palette || PALETTES[0],
  });
  console.log({ pixelsHistory });

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
  const previousCanvasId =
    previousCanvas?.id || Number(currentCanvas?.id || 2) - 1;

  const disableRiff =
    currentCanvas?.prompt && currentCanvas?.prompt?.id !== latestCanvasPromptId;

  useEffect(() => {
    const fetchSVG = async () => {
      // const svgData = await dailyCanvasContract.getTileSVG(String(id));

      const dataRaw = await dailyCanvasContract.getCanvasPixels(String(id));
      const svgData = getSVG(dataRaw);

      // If history based on riffId in localstorage is only one, then we can safely
      // reset it to the svgData, otherwise there is riff history and we shouldn't overwrite
      const ret = getPixelsFrom(svgData);
      console.log({ ret });
      setPixels(getPixelsFrom(svgData));
    };
    if (id) {
      fetchSVG();
    }
  }, [id]);

  const ens = useENS(currentCanvas?.author || "");

  useKeyPress(["ArrowLeft"], () => {
    if (previousCanvasId) {
      router.push(`/canvas/${previousCanvasId}/view`);
    }
  });

  useKeyPress(["ArrowRight"], () => {
    if (nextCanvas) {
      router.push(`/canvas/${nextCanvas.id}/view`);
    }
  });

  return currentCanvas ? (
    <div className="flex flex-col h-full w-full items-center overflow-hidden">
      <Header title="The Scroll" className="pb-4"></Header>
      <div className="flex-1" />
      <div className="flex-1 canvas-fix">
        <SVG
          src={currentCanvas.svg}
          width={Number(currentCanvas.prompt.width) * PIXEL_SIZE}
          height={Number(currentCanvas.prompt.height) * PIXEL_SIZE}
        ></SVG>
        <div className="flex flex-col h-full">
          <div className="w-full flex flex-row justify-between my-2 font-mono text-white ">
            <Link href={`/canvas/${previousCanvasId}/view`}>
              <button
                disabled={!previousCanvasId}
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
          {disableRiff && (
            <div className="flex justify-center">
              <p
                className={`text-white ${
                  dateString === "today" ? "invisible" : ""
                }`}
              >
                {dateString}
              </p>
            </div>
          )}
          <div
            className={`flex justify-center pt-8 ${
              disableRiff ? "invisible" : ""
            }`}
          >
            <Button
              onClick={handleRiffClick}
              disabled={
                riffLoading ||
                !pixels?.length ||
                !pixelsHistory?.length ||
                disableRiff
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
