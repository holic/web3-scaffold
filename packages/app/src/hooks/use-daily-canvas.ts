import { useQuery } from "urql";
import { CanvasResponse } from "../types/Daily";

// todo: order?
const IndividualCanvasQuery = `query IndividualCanvasQuery($canvasId: ID) {
    canvasResponses(where: {id: $canvasId}) {
      id
      author
      svg
      tokenURI
      prompt {
        id
        palette
      }
      riffCanvasId
    }
  }
`;

interface UseDailyCanvasOptions {
  id: string;
}

export const useCanvasResponse = ({ id }: UseDailyCanvasOptions) => {
  const [result, reexecuteQuery] = useQuery({
    query: IndividualCanvasQuery,
    variables: { canvasId: id },
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

  const singleton = parsedData?.length <= 1 ? parsedData[0] : undefined;

  return [{ ...result, data: singleton }, reexecuteQuery];
};

export default useCanvasResponse;
