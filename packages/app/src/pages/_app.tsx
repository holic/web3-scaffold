import "tailwindcss/tailwind.css";
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import {
  createClient as createGraphClient,
  Provider as GraphProvider,
} from "urql";
// @ts-ignore
import "./global.css";

import { EthereumProviders } from "../EthereumProviders";

export const graphClient = createGraphClient({
  url: "https://api.thegraph.com/subgraphs/name/jborichevskiy/daily-canvas",
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>The Scroll</title>
        <meta
          name="description"
          content="One new canvas, everyday, for your pixels."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>

        <link rel="shortcut icon" href="/static/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/static/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/static/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/static/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/static/favicon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/static/favicon-512x512.png"
        />
      </Head>
      <GraphProvider value={graphClient}>
        <EthereumProviders>
          <Component {...pageProps} />
        </EthereumProviders>
      </GraphProvider>
      <ToastContainer position="bottom-right" draggable={false} />
    </>
  );
};

export default MyApp;
