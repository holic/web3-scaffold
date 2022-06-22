import { useState } from "react";
import { gzipSync, gunzipSync } from "zlib";
import { Pixels } from "../hooks/use-editor";
import { useDebouncedCallback } from "use-debounce";
import { useLocalStorage } from "react-use";

import { getBinarySVG_2DArr } from "@exquisite-graphics/js";
import PALETTES from "../constants/Palettes";

//TODO: .env
const CONTRACT_ADDRESS = "0x65438df4172a9f6ac18a2821283d7cdc4b80b389";
const tileSize = 16;
const tileColumns = Array.from(Array(tileSize).keys());
const tileRows = Array.from(Array(tileSize).keys());
const emptyTile: Pixels = tileColumns.map(() =>
  tileRows.map(() => PALETTES[0][13])
);

const serializer = <T,>(value: T): string =>
  gzipSync(JSON.stringify(value)).toString("base64");
const deserializer = <T,>(value: string): T =>
  JSON.parse(gunzipSync(Buffer.from(value, "base64")).toString());

export const usePixels = (x: number, y: number) => {
  const [pixelsHistory, setPixelsHistory] = useLocalStorage<Pixels[]>(
    `pixels:v1:${CONTRACT_ADDRESS}:${x},${y}`,
    [emptyTile],
    { raw: false, serializer, deserializer }
  );

  const [pixels, setPixelsState] = useState<Pixels>(
    pixelsHistory?.[0] || emptyTile
  );

  const getExquisiteData = () => {
    //this is what we send to contract

    // @ts-ignore
    const data = getBinarySVG_2DArr(pixels).getPixelBuffer();
    return data;
  };

  const addPixelsToHistory = useDebouncedCallback((newPixels: Pixels) => {
    setPixelsHistory([newPixels, ...(pixelsHistory || [emptyTile])]);
  }, 500);

  const setPixels = (newPixels: Pixels) => {
    console.log("setting pixels", newPixels);
    setPixelsState(newPixels);
    addPixelsToHistory(newPixels);
  };

  const undo = () => {
    const [_pixels, ...prevPixelsHistory] = pixelsHistory || [emptyTile];
    setPixelsHistory(prevPixelsHistory);
    setPixelsState(prevPixelsHistory[0] || emptyTile);
  };

  const canUndo = pixelsHistory && pixelsHistory.length > 0;

  return { pixels, setPixels, undo, canUndo, getExquisiteData };
};
