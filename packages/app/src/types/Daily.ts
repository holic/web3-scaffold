export interface Daily {
  id: string;
  author: string;
  tokenURI: string;
  promptId: number;
  svg: string;
}

export interface DailiesQueryResponse {
  dailies: Daily[];
}
