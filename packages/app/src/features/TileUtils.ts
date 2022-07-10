import { Pixels } from "../hooks/use-editor";
import PALETTES from "../constants/Palettes";

export const generateTokenID = (x: number, y: number): number => (x << 8) | y;
export const getCoordinates = (tokenId: number): [number, number] => [
  (tokenId & 0x0000ff00) >> 8,
  tokenId & 0x000000ff,
];

const PATH_SVG_OPENER =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 -0.5 ';
const CLOSE_SVG_OPENER = '">';
const PATH_PREFIX = '<path stroke="';
const PATH_START_DATA = '" d="';
const END_TAG = '"/>';

const SVG_OPENER =
  '<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 32 32">';
const SVG_CLOSER = "</svg>";

function transpose(matrix: any) {
  return matrix.reduce(
    (prev: any, next: any) =>
      next.map((_: any, i: number) => (prev[i] || []).concat(next[i])),
    []
  );
}

export const getEthPixelData = (pixels: Pixels): string => {
  const transposed = transpose(pixels);
  const flattened = transposed.flat();
  let outputPixels = "0x";
  for (let i = 0; i < flattened.length; i++) {
    const d = `${flattened[i].toString(16).padStart(2, "0")}`;
    outputPixels += d;
  }

  return outputPixels;
};

export const getPathSVGFromPixels = (pixels: Pixels) => {
  const data = getEthPixelData(pixels);
  return getSVGFromData(data, PALETTES[0], 32, 32);
};

export const getSVGFromPixels = (pixels: Pixels) => {
  let output = SVG_OPENER;
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      output += `<rect fill="${
        // @ts-ignore
        PALETTES[0][pixels[x][y]]
      }" x="${x}" y="${y}" width="1.5" height="1.5" />`;
    }
  }

  output += SVG_CLOSER;
  return output;
};

export const getSVGFromData = (
  data: string,
  palette: string[],
  numRows: number,
  numCols: number
) => {
  const dataBytes = hexToBytes(data.slice(2));
  const numColors = palette.length;
  const paths = new Array(numColors).fill("");

  for (let h = 0; h < numRows; h++) {
    for (let m = 0; m < numCols; m) {
      const index = h * numCols + m;

      const c = countConsecutive(index, numCols, dataBytes);
      const ci = dataBytes[index];

      paths[ci] += `M${m} ${h}h${c}`;
      m += c;
    }
  }

  let output = `${PATH_SVG_OPENER}${numCols} ${numRows}${CLOSE_SVG_OPENER}`;

  for (let i = 0; i < numColors; i++) {
    if (paths[i] == "") continue;
    output += `${PATH_PREFIX}${palette[i]}${PATH_START_DATA}${paths[i]}${END_TAG}`;
  }

  output += SVG_CLOSER;
  return output;
};

function hexToBytes(hex: string): number[] {
  let bytes, c;
  for (bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function countConsecutive(index: number, numCols: number, data: number[]) {
  let num = 1;

  while ((index + num) % numCols != 0) {
    if (data[index] == data[index + num]) num++;
    else break;
  }

  return num;
}
