import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { getChains } from "./utils/getChains";

const targetChains = getChains();

// Use the first chain specified as target chain. Maybe in the future this can be configurable.
export const targetChainId = targetChains[0].id;

export const { chains, provider, webSocketProvider } = configureChains(
  targetChains,
  [
    alchemyProvider({
      alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Example NFT",
  chains,
});

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export const EthereumProviders: React.FC = ({ children }) => (
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
  </WagmiConfig>
);
