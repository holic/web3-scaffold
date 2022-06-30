// import {
//   createTile,
//   getSignatureForTypedData,
//   submitTx,
//   TypedData
// } from '@app/features/Forwarder';
// import { getJsonRpcProvider } from '@app/features/getJsonRpcProvider';
// import useStore from "@app/features/State";
// import { getEthPixelData } from "@app/features/TileUtils";
// import useTransactionsStore from "@app/features/useTransactionsStore";
// import { useWallet } from "@gimmixorg/use-wallet";
import { useState } from "react";
import PALETTES from "../constants/Palettes";

export type Pixels = readonly (readonly string[])[];

export enum Tool {
  BRUSH = "BRUSH",
  BUCKET = "BUCKET",
  EYEDROPPER = "EYEDROPPER",
}

interface SetTileProps {
  pixels: Pixels;
  x: number;
  y: number;
}

const useEditor = () => {
  const palette = PALETTES[0];

  const [activeBrushSizeNumber, setActiveBrushSizeNumber] = useState(1);
  const [activeColorString, setActiveColorString] = useState(palette[1]);
  const [activeToolValue, setActiveToolValue] = useState(Tool.BRUSH);
  const [prevToolValue, setPrevToolValue] = useState(Tool.BRUSH);

  // const { account, provider } = useWallet();

  const setActiveTool = (tool: Tool) => {
    // setPrevToolValue(activeToolValue);
    setActiveToolValue((currentActiveTool) => {
      setPrevToolValue(currentActiveTool);
      return tool;
    });
  };

  const setActiveColor = (hex: string) => {
    setActiveColorString(hex);
  };

  const setActiveBrushSize = (size: number) => {
    if (size < 1) size = 1;
    else if (size > 8) size = 8;
    setActiveBrushSizeNumber(size);
  };

  const getActiveCursor = () => {
    switch (activeToolValue) {
      case Tool.BRUSH:
        return "url(/static/px-icon-pencil.svg) 0 11, pointer";
      case Tool.BUCKET:
        return "url(/static/px-icon-bucket.svg) 0 11, pointer";
      case Tool.EYEDROPPER:
        return "url(/static/px-icon-eyedropper.svg) 4 11, pointer";
    }
  };

  // const signToSubmitTile = async ({ x, y, pixels }: SetTileProps) => {
  //   if (!provider || !account) throw 'Not signed in.';
  //   const outputPixels = getEthPixelData(pixels);
  //   const dataToSign = await createTile(
  //     x,
  //     y,
  //     outputPixels,
  //     account,
  //     getJsonRpcProvider
  //   );
  //   const signature = await getSignatureForTypedData(provider, dataToSign);
  //   return { dataToSign, signature };
  // };

  // const submitTile = async ({
  //   x,
  //   y,
  //   pixels,
  //   dataToSign,
  //   signature
  // }: {
  //   x: number;
  //   y: number;
  //   pixels: Pixels;
  //   dataToSign: TypedData;
  //   signature: string;
  // }) => {
  //   const tx = await submitTx(dataToSign, signature);
  //   useTransactionsStore.getState().addTransaction({
  //     title: `Minting tile [${x},${y}]`,
  //     hash: tx.hash,
  //     status: 'pending',
  //     date: new Date(),
  //     type: 'create-tile',
  //     x,
  //     y,
  //     pixels,
  //     account
  //   });
  //   return tx;
  // };

  return {
    palette,
    prevTool: prevToolValue,
    activeTool: activeToolValue,
    activeColor: activeColorString,
    activeBrushSize: activeBrushSizeNumber,
    setActiveBrushSize,
    setActiveColor,
    setActiveTool,
    // todo; write these
    signToSubmitTile: () => {},
    submitTile: () => {},
    getActiveCursor,
  };
};

export default useEditor;
