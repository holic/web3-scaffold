import "tailwindcss/tailwind.css";

import type { AppProps } from "next/app";
import {
  createClient as createGraphClient,
  Provider as GraphProvider,
} from "urql";

export const graphClient = createGraphClient({
  url: "https://api.thegraph.com/subgraphs/name/holic/example-nft",
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <GraphProvider value={graphClient}>
      <Component {...pageProps} />
    </GraphProvider>
  );
};

export default MyApp;
