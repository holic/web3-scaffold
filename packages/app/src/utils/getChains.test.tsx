import { getChainSlugs } from "./getChains";

describe("getChains", () => {
  const env = process.env;

  it("should get default chains when chain slugs is empty", () => {
    process.env = { ...env, NEXT_PUBLIC_CHAIN_SLUGS: "" };
    expect(getChainSlugs()).toStrictEqual(["goerli", "mainnet"]);
  });

  it("should get chains when chain slugs is set", () => {
    process.env = {
      ...env,
      NEXT_PUBLIC_CHAIN_SLUGS: "foundry, mainnet,optimism",
    };
    expect(getChainSlugs()).toStrictEqual(["foundry", "mainnet", "optimism"]);
  });

  it("should ignore invalid chain slugs when set", () => {
    process.env = {
      ...env,
      NEXT_PUBLIC_CHAIN_SLUGS: "foundry, mainnet,fakechain",
    };
    expect(getChainSlugs()).toStrictEqual(["foundry", "mainnet"]);
  });

  afterEach(() => {
    process.env = env;
  });
});
