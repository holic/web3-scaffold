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
import { monkeypatch } from "monkeypatch";
// const monkeypatch = require("monkeypatch");
import "./global.css";

import { EthereumProviders } from "../EthereumProviders";

import fs from "fs";

export const graphClient = createGraphClient({
  url: "https://api.thegraph.com/subgraphs/name/jborichevskiy/daily-canvas",
});

monkeypatch(fs, "readFileSync", function () {
  return {};
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Daily Canvas</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>
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
