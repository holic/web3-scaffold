import { useMemo, useState } from "react";
import { gzipSync, gunzipSync } from "zlib";
import { Pixels } from "../hooks/use-editor";
import { useDebouncedCallback } from "use-debounce";
import { useLocalStorage } from "react-use";

import { getBinarySVG_2DArr } from "@exquisite-graphics/js";

function transpose(matrix: any) {
  return matrix.reduce(
    (prev: any, next: any) =>
      next.map((_: any, i: number) => (prev[i] || []).concat(next[i])),
    []
  );
}

// import PALETTES from "../constants/Palettes";

//TODO: .env
const CONTRACT_ADDRESS = "0x81721f9d903b7811aefbe9f5708251411a8ff05e";
const tileSize = 20;
const tileColumns = Array.from(Array(tileSize).keys());
const tileRows = Array.from(Array(tileSize).keys());

const serializer = <T,>(value: T): string =>
  gzipSync(JSON.stringify(value)).toString("base64");
const deserializer = <T,>(value: string): T =>
  JSON.parse(gunzipSync(Buffer.from(value, "base64")).toString());

interface UsePixelsOptions {
  keySuffix?: string;
  palette: string[];
}

export const usePixels = (options: UsePixelsOptions) => {
  const { keySuffix = "editor", palette } = options;

  const emptyTile: Pixels = useMemo(() => {
    return tileColumns.map(() => tileRows.map(() => palette[0]));
  }, [palette]);

  const key = `pixels:v1:${CONTRACT_ADDRESS}:${keySuffix}`;
  const [pixelsHistory, setPixelsHistory] = useLocalStorage<Pixels[]>(
    key,
    [emptyTile],
    { raw: false, serializer, deserializer }
  );

  const [pixels, setPixelsState] = useState<Pixels>(
    pixelsHistory?.[0] || emptyTile
  );

  const getExquisiteData = () => {
    // @ts-ignore
    const data = getBinarySVG_2DArr(transpose(pixels)).getPixelBuffer();
    return data;
  };

  const addPixelsToHistory = useDebouncedCallback((newPixels: Pixels) => {
    setPixelsHistory([newPixels, ...(pixelsHistory || [emptyTile])]);
  }, 500);

  const resetPixels = () => {
    global?.localStorage?.removeItem(key);
    setPixelsState(emptyTile);
  };

  const replacePixels = (newPixels: Pixels[]) => {
    setPixelsHistory(newPixels);
    if (newPixels?.[0]) setPixelsState(newPixels[0]);
  };

  const setPixels = (newPixels: Pixels) => {
    setPixelsState(newPixels);
    addPixelsToHistory(newPixels);
  };

  const undo = () => {
    // eslint-disable-next-line
    const [_pixels, ...prevPixelsHistory] = pixelsHistory || [emptyTile];
    setPixelsHistory(prevPixelsHistory);
    setPixelsState(prevPixelsHistory[0] || emptyTile);
  };

  const canUndo = pixelsHistory && pixelsHistory.length > 0;

  return {
    pixels,
    setPixels,
    undo,
    canUndo,
    getExquisiteData,
    resetPixels,
    replacePixels,
    pixelsHistory,
    emptyTile,
  };
};
