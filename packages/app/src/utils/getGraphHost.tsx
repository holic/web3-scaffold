export const getGraphHost = (): string => {
  return process.env.NEXT_PUBLIC_GRAPH_HOST
    ? process.env.NEXT_PUBLIC_GRAPH_HOST
    : "https://api.thegraph.com";
};
