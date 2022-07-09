import { useQuery } from "urql";
import { CanvasResponse } from "../types/Daily";

// const IndividualCanvasQuery = `query IndividualCanvasQuery($canvasId: ID) {
//   canvasResponses(where: {id: $canvasId} ) {
//     id
//     author
//     svg
//     tokenURI
//     prompt {
//       id
//       palette
//     }
//     riffCanvasId
//   }
// }
// `;

const useDailies = () => {
  const [result, reexecuteQuery] = useQuery({
    // @ts-ignore
    query: 1,
    variables: {
      promptId: 3,
    },
  });

  const parsedData = result.data?.canvasResponses
    .map((canvas: CanvasResponse) => {
      return {
        ...canvas,
        id: Number(canvas.id),
      };
    })
    .sort((a: CanvasResponse, b: CanvasResponse) => {
      return Number(a.id) - Number(b.id);
    });

  return [{ ...result, data: parsedData }, reexecuteQuery];
};

export default useDailies;
