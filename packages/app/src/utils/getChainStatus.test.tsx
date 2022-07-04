import { getChainStatus } from "./getChainStatus";

describe("getChainStatus", () => {
  const env = process.env;

  it("should get default chain status when env is empty", () => {
    process.env = { ...env, NEXT_PUBLIC_CHAIN_STATUS: "" };
    expect(getChainStatus()).toStrictEqual("icon");
  });

  it("should get chain status env is set", () => {
    process.env = { ...env, NEXT_PUBLIC_CHAIN_STATUS: "none" };
    expect(getChainStatus()).toStrictEqual("none");
  });

  it("should ignore invalid chain status when set", () => {
    process.env = { ...env, NEXT_PUBLIC_CHAIN_STATUS: "fakestatus" };
    expect(getChainStatus()).toStrictEqual("icon");
  });

  afterEach(() => {
    process.env = env;
  });
});
