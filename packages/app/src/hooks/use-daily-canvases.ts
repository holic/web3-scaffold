import { useQuery } from "urql";
import { Daily } from "../types/Daily";

const CanvasQuery = `
  query {
    dailies(first: 100) {
      id
      author
      svg
      tokenURI
      promptId
      riffCanvasId
    }
  }
`;

const useDailies = () => {
  const [result, reexecuteQuery] = useQuery({
    query: CanvasQuery,
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

  return [{ ...result, data: parsedData }, reexecuteQuery];
};

export default useDailies;
