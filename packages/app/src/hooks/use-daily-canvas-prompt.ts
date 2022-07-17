import { useMemo } from "react";
import { useQuery, UseQueryResponse } from "urql";
import { CanvasPrompt, CanvasResponse } from "../types/Daily";

interface UseDailyCanvasPromptOptions {
  includeResponses: boolean;
}

interface CanvasPromptQueryResponse {
  canvasPrompts: CanvasPrompt[];
}

export const useDailyCanvasPrompt = (
  options?: UseDailyCanvasPromptOptions
): UseQueryResponse<CanvasPrompt> => {
  const { includeResponses } = options || {};

  const LatestPromptQuery = `{
    canvasPrompts(first: 1, orderBy: createdAt, orderDirection: desc) {
      id
      width
      height
      author
      palette
      ${
        includeResponses
          ? `
          responses {
            id
            svg
          }
        `
          : ""
      }
    }
  }
  `;

  const [result, reexecuteQuery] = useQuery<CanvasPromptQueryResponse>({
    query: LatestPromptQuery,
  });

  const canvasPrompt = useMemo(() => {
    const data = result?.data?.canvasPrompts?.[0] || undefined;

    let responses: CanvasResponse[] = [];
    if (data && data.responses) {
      responses = data.responses.sort(
        (a: CanvasResponse, b: CanvasResponse) => {
          return Number(a.id) - Number(b.id);
        }
      );
    }

    return data
      ? {
          ...data,
          responses,
        }
      : undefined;
  }, [result?.data]);

  return [{ ...result, data: canvasPrompt }, reexecuteQuery];
};

export default useDailyCanvasPrompt;
