import React, { useEffect } from "react";
import createStore from "zustand";
import { persist } from "zustand/middleware";

import { cachedFetch } from "./cachedFetch";

type State = {
  resolvedAddresses: Partial<Record<string, any>>;
};

// Just to have some data cached here already
const precacheString = `{"0x40ff52e1848660327f16ed96a307259ec1d757eb":{"address":"0x40FF52E1848660327F16ED96a307259Ec1D757eB","name":"codyb.eth","displayName":"codyb.eth","avatar":null},"0xc5ea588b857168f7b9f908f44ed0572d10a9a2f1":{"address":"0xc5Ea588B857168f7b9f908F44ed0572d10a9A2F1","name":"tyukayev.eth","displayName":"tyukayev.eth","avatar":"https://www.tyukayev.com/headshot.jpeg"},"0x292ff025168d2b51f0ef49f164d281c36761ba2b":{"address":"0x292ff025168D2B51f0Ef49f164D281c36761BA2b","name":"jonbo.eth","displayName":"jonbo.eth","avatar":null}}`;

export const useEnsStore = createStore<State>(
  persist((set) => ({ resolvedAddresses: JSON.parse(precacheString) }), {
    name: "resolved-ens",
  })
);

export const useENS = (address: string) => {
  const addressLowercase = address.toLowerCase();
  const resolved = useEnsStore(
    (state) => state.resolvedAddresses[addressLowercase]
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await cachedFetch(
          `https://api.ensideas.com/ens/resolve/${addressLowercase}`
        ).then((res) => res.json());
        useEnsStore.setState((state) => ({
          resolvedAddresses: {
            ...state.resolvedAddresses,
            [addressLowercase]: data,
          },
        }));
      } catch (error) {
        console.log("could not resolve ens", error);
      }
    })();
  }, [addressLowercase]);

  return {
    address: resolved?.address,
    name: resolved?.name,
    displayName: resolved?.displayName,
    avatar: resolved?.avatar,
  };
};
