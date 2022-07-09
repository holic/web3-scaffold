export interface CanvasResponse {
  id: string;
  author: string;
  tokenURI: string;
  prompt: CanvasPrompt;
  svg: string;
}

export interface CanvasResponseQuery {
  dailies: CanvasResponse[];
}

export interface CanvasPrompt {
  id: string;
  width: bigint;
  height: bigint;
  author: string;
  palette: string[];
  createdAt: bigint;
  responses: CanvasResponse[];
}

export interface CanvasPromptResponses {
  canvasPrompts: CanvasPrompt;
}
