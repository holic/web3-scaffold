import { useEffect } from "react";
import { useQuery, UseQueryResponse, RequestPolicy } from "urql";
import { CanvasResponse } from "../types/Daily";
import store from "../store";

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

const RESOURCE = "CanvasResponse";

export const useCanvasResponse = (
  variables: UseCanvasResponseVariables,
  options?: UseCanvasResponseOptions
): UseQueryResponse<CanvasResponse> => {
  const { query, requestPolicy, pollingInterval } = options || {};

  const storeKey = `${RESOURCE}:${variables.canvasId}`;

  const cachedCanvasResponse = store((state) => state.requests[storeKey]);

  const [result, reexecuteQuery] = useQuery({
    query: query || IndividualCanvasQuery,
    variables,
    requestPolicy: requestPolicy || "cache-and-network",
  });

  const canvasResponse = result.data?.canvasResponses?.[0] || null;

  useEffect(() => {
    if (canvasResponse?.id) {
      store.setState((state) => ({
        requests: {
          ...state.requests,
          [storeKey]: canvasResponse,
        },
      }));
    }
  }, [canvasResponse, storeKey]);

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

  return [
    { ...result, data: canvasResponse || cachedCanvasResponse },
    reexecuteQuery,
  ];
};

export default useCanvasResponse;
