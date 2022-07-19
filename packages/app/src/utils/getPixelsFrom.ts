import { CANVAS_SIZE } from "../constants/Editor";

function transpose(matrix: any) {
  return matrix.reduce(
    (prev: any, next: any) =>
      next.map((_: any, i: number) => (prev[i] || []).concat(next[i])),
    []
  );
}

const getPixelsFrom = (svgData: string) => {
  const fillRe = /fill="#(#(.){6})/g;
  const fillRePattern = new RegExp(fillRe);
  const pixels = [];
  let match;
  while ((match = fillRePattern.exec(svgData))) {
    pixels.push(match[1]);
  }

  const outRows = [];

  const chunkSize = CANVAS_SIZE;
  for (let i = 0; i < pixels.length; i += chunkSize) {
    const chunk = pixels.slice(i, i + chunkSize);
    outRows.push(chunk);
  }
  return transpose(outRows);
};

export default getPixelsFrom;
