import { getContractAddress } from "./getContractAddress";

describe("getContractAddress", () => {
  const env = process.env;

  it("should get default contract address", () => {
    process.env = { ...env, NEXT_PUBLIC_CONTRACT_ADDRESS: "" };
    expect(getContractAddress()).toBe(
      "0xe584409f2ba1ade9895485d90587fd46baa3c0d8"
    );
  });

  it("should get contract address from env when set", () => {
    process.env = {
      ...env,
      NEXT_PUBLIC_CONTRACT_ADDRESS:
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    };
    expect(getContractAddress()).toBe(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );
  });

  afterEach(() => {
    process.env = env;
  });
});
