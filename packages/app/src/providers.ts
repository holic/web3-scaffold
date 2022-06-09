import { StaticJsonRpcProvider } from "@ethersproject/providers";

export const ethereumProvider = new StaticJsonRpcProvider(
  process.env.NEXT_PUBLIC_ETHEREUM_RPC_ENDPOINT
);
