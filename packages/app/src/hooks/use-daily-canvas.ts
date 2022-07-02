import { useQuery } from "urql";
import { Daily } from "../types/Daily";

// todo: order?
const IndividualCanvasQuery = `query IndividualCanvasQuery($canvasId: ID) {
    dailies(where: {id: $canvasId}) {
      id
      author
      svg
      tokenURI
      promptId
      riffCanvasId
    }
  }
`;

interface UseDailyCanvasOptions {
  id: string;
}

export const useDailyCanvas = ({ id }: UseDailyCanvasOptions) => {
  const [result, reexecuteQuery] = useQuery({
    query: IndividualCanvasQuery,
    variables: { canvasId: id },
  });

  const parsedData = result.data?.dailies
    .map((daily: Daily) => {
      return {
        ...daily,
        id: Number(daily.id),
      };
    })
    .sort((a: Daily, b: Daily) => {
      return Number(a.id) - Number(b.id);
    });

  const singleton = parsedData?.length <= 1 ? parsedData[0] : undefined;

  return [{ ...result, data: singleton }, reexecuteQuery];
};

export default useDailyCanvas;
