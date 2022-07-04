import { getGraphHost } from "./getGraphHost";

describe("getGraphHost", () => {
  const env = process.env;

  it("should get default graph host", () => {
    process.env = { ...env, NEXT_PUBLIC_GRAPH_HOST: "" };
    expect(getGraphHost()).toBe("https://api.thegraph.com");
  });

  it("should get graph host from env when set", () => {
    process.env = { ...env, NEXT_PUBLIC_GRAPH_HOST: "http://127.0.0.1:8000" };
    expect(getGraphHost()).toBe("http://127.0.0.1:8000");
  });

  afterEach(() => {
    process.env = env;
  });
});
