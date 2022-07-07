import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import SVG from "react-inlinesvg";
import useDailies from "../../../hooks/use-daily-canvases";
import Link from "next/link";
import Button from "../../../components/Button";
import { getSVG } from "@exquisite-graphics/js";
import { dailyCanvasContract } from "../../../contracts";
import Header from "../../../components/Header";
import { usePixels } from "../../../components/usePixels";
import getPixelsFrom from "../../../utils/getPixelsFrom";
import { Pixels } from "../../../hooks/use-editor";
import { CANVAS_SIZE, PIXEL_SIZE } from "../../../constants/Editor";
import useDailyCanvas from "../../../hooks/use-daily-canvas";
import useKeyPress from "../../../hooks/use-keypress";
import { useENS } from "../../../useENS";

const CanvasViewPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [
    {
      // @ts-ignore
      data: currentCanvas,
      // @ts-ignore
      fetching: currentCanvasFetching,
      // @ts-ignore
      error: currentCanvasError,
    },
  ] = useDailyCanvas({
    id: String(id),
  });

  useEffect(() => {
    if (!currentCanvasFetching && (!currentCanvas || currentCanvasError)) {
      toast(`Canvas #${id} not found`);
      router.push("/");
    }
  }, [currentCanvasFetching, currentCanvas, currentCanvasError, id, router]);

  const [pixels, setPixels] = useState<Pixels | undefined>(undefined);
  const [riffLoading, setRiffLoading] = useState<boolean>(false);
  const { pixelsHistory, replacePixels } = usePixels(
    id
      ? {
          keySuffix: String(id),
        }
      : {}
  );

  const [result] = useDailies();
  // @ts-ignore
  const { data: allDailyCanvases = [] } = result;

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

  // const currentCanvas = useMemo(
  //   () => allDailyCanvases?.[Number(id) - 1],
  //   [allDailyCanvases, id]
  // );
  const nextCanvas = useMemo(
    () =>
      allDailyCanvases?.find((x: any) => {
        return Number(x.id) === Number(id) + 1;
      }) || NaN,
    [allDailyCanvases, id]
  );
  const previousCanvas = useMemo(
    () =>
      allDailyCanvases?.find((x: any) => {
        return Number(x.id) === Number(id) - 1;
      }) || NaN,
    [allDailyCanvases, id]
  );

  useEffect(() => {
    const fetchSVG = async () => {
      // const svgData = await dailyCanvasContract.getTileSVG(String(id));

      const dataRaw = await dailyCanvasContract.getCanvasPixels(String(id));
      const svgData = getSVG(dataRaw);

      // If history based on riffId in localstorage is only one, then we can safely
      // reset it to the svgData, otherwise there is riff history and we shouldn't overwrite
      // console.log({ pixelsHistory, length: pixelsHistory.length });
      setPixels(getPixelsFrom(svgData));
    };

    if (id) {
      fetchSVG();
    }
  }, [id, pixelsHistory, riffLoading]);

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

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <Header title="Daily Canvas"></Header>
      <div className="h-96 pt-4 p-6">
        <SVG
          src={currentCanvas?.svg}
          width={CANVAS_SIZE * PIXEL_SIZE}
          height={CANVAS_SIZE * PIXEL_SIZE}
          className={"svgFix"}
        ></SVG>
        <div className="flex flex-col h-full">
          <div className="w-full flex flex-row justify-between my-2 font-mono text-white ">
            <Link href={`/canvas/${previousCanvas.id}/view`}>
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

            <Link href={`/canvas/${nextCanvas.id}/view`}>
              <button disabled={!nextCanvas} className="disabled:opacity-30">
                next ➡️
              </button>
            </Link>
          </div>
          <span className="text-white text-gray-800">
            {/* todo: if self is author, add share btn */}
          </span>
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
    </div>
  );
};

export default CanvasViewPage;
