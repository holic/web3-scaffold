import "tailwindcss/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";

import type { AppProps } from "next/app";
import {
  createClient as createGraphClient,
  Provider as GraphProvider,
} from "urql";

import { EthereumProviders } from "../EthereumProviders";

export const graphClient = createGraphClient({
  url: "https://api.thegraph.com/subgraphs/name/holic/example-nft",
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <GraphProvider value={graphClient}>
      <EthereumProviders>
        <Component {...pageProps} />
      </EthereumProviders>
    </GraphProvider>
  );
};

export default MyApp;
