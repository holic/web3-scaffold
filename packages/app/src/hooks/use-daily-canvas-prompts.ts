import { useMemo } from "react";
import { useQuery, UseQueryResponse } from "urql";
import { CanvasPrompt, CanvasResponse } from "../types/Daily";

interface UseDailyCanvasPromptOptions {
  includeResponses: boolean;
}

interface CanvasPromptQueryResponse {
  canvasPrompts: CanvasPrompt[];
}

export const useDailyCanvasPrompts = (
  options?: UseDailyCanvasPromptOptions
): UseQueryResponse<CanvasPrompt[]> => {
  const { includeResponses } = options || {};

  const LatestPromptQuery = `{
    canvasPrompts(orderBy: createdAt, orderDirection: desc) {
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
            author
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

  const canvasPrompts = useMemo(() => {
    const prompts: CanvasPrompt[] = [];
    result?.data?.canvasPrompts?.forEach((prompt) => {
      const data = prompt;

      let responses: CanvasResponse[] = [];
      if (data && data.responses) {
        responses = data.responses.sort(
          (a: CanvasResponse, b: CanvasResponse) => {
            return Number(b.id) - Number(a.id);
          }
        );
      }

      if (data) {
        prompts.push({
          ...data,
          responses,
        });
      }
    });
    return prompts;
  }, [result?.data]);

  return [{ ...result, data: canvasPrompts }, reexecuteQuery];
};

export default useDailyCanvasPrompts;
