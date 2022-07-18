export const getSubgraphURL = (): string => {
  return process.env.NEXT_PUBLIC_SUBGRAPH_URL
    ? process.env.NEXT_PUBLIC_SUBGRAPH_URL
    : "https://api.thegraph.com/subgraphs/name/holic/example-nft";
};
