import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { createClient, defaultChains, WagmiConfig } from "wagmi";

// Will default to goerli if nothing set in the ENV
export const targetChainId =
  parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "0") || 5;

// filter down to just mainnet + optional target testnet chain so that rainbowkit can tell
// the user to switch network if they're on an alternative one
const targetChains = defaultChains.filter(
  (chain) => chain.id === 1 || chain.id === targetChainId
);

export const wagmiClient = createClient(
  getDefaultClient({
    appName: "Web3 App",
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    chains: targetChains,
  })
);

export const EthereumProviders: React.FC = ({ children }) => (
  <WagmiConfig client={wagmiClient}>
    <ConnectKitProvider>{children}</ConnectKitProvider>
  </WagmiConfig>
);
