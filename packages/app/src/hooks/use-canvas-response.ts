import { useEffect } from "react";
import { useQuery, UseQueryResponse, RequestPolicy } from "urql";
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
        height
        width
      }
      riffCanvasId
    }
  }
`;

interface UseCanvasResponseVariables {
  canvasId?: string;
}

interface UseCanvasResponseOptions {
  query?: string;
  requestPolicy?: RequestPolicy;
  pollingInterval?: number;
}

export const useCanvasResponse = (
  variables: UseCanvasResponseVariables,
  options?: UseCanvasResponseOptions
): UseQueryResponse<CanvasResponse> => {
  const { query, requestPolicy, pollingInterval } = options || {};

  const [result, reexecuteQuery] = useQuery({
    query: query || IndividualCanvasQuery,
    variables,
    requestPolicy: requestPolicy || "cache-and-network",
  });

  useEffect(() => {
    // @ts-ignore
    let interval;
    if (pollingInterval) {
      interval = setInterval(() => reexecuteQuery(), pollingInterval);
    }
    return () => {
      // @ts-ignore
      if (interval) clearInterval(interval);
    };
  }, [reexecuteQuery, pollingInterval]);

  const canvasResponse = result.data?.canvasResponses?.[0] || null;

  return [{ ...result, data: canvasResponse }, reexecuteQuery];
};

export default useCanvasResponse;
