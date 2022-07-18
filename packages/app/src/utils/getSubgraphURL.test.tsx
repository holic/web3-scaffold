import { getSubgraphURL } from "./getSubgraphURL";

describe("getSubgraphURL", () => {
  const env = process.env;

  it("should get default graph host", () => {
    process.env = { ...env, NEXT_PUBLIC_SUBGRAPH_URL: "" };
    expect(getSubgraphURL()).toBe(
      "https://api.thegraph.com/subgraphs/name/holic/example-nft"
    );
  });

  it("should get graph host from env when set", () => {
    process.env = {
      ...env,
      NEXT_PUBLIC_SUBGRAPH_URL:
        "http://127.0.0.1:8000/subgraphs/name/holic/example-nft",
    };
    expect(getSubgraphURL()).toBe(
      "http://127.0.0.1:8000/subgraphs/name/holic/example-nft"
    );
  });

  afterEach(() => {
    process.env = env;
  });
});
