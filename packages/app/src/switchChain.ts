import { Connector } from "wagmi";

import { targetChainId } from "./EthereumProviders";

// TODO: custom errors?

export const switchChain = async (
  activeConnector: Connector,
  chainId: number = targetChainId
) => {
  if (!activeConnector) {
    throw new Error("No wallet connected");
  }

  const provider = await activeConnector.getProvider();

  const clientName = provider.connector?.peerMeta?.name ?? "";
  console.log({ clientName });
  const isRainbow = /rainbow/i.test(clientName);

  const currentChainId = await activeConnector.getChainId();
  console.log({ currentChainId });
  if (currentChainId === chainId) {
    return;
  }

  // Triggering a network switch with Rainbow for a non-mainnet chain will get the
  // Rainbow app to open, but does nothing except invisibly throw an error, which you
  // won't see unless you tab back to the page/browser. So we'll skip it for now.
  // TODO: file an issue/repro case about this
  if (activeConnector.switchChain && (!isRainbow || chainId === 4)) {
    await activeConnector.switchChain(chainId);
    return;
  }
  console.log(isRainbow);

  // Likely the connected wallet doesn't support chain switching
  throw new Error("Wrong network");
};
