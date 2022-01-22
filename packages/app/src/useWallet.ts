import { Network, Web3Provider } from "@ethersproject/providers";
import { useCallback } from "react";
import Web3Modal, { ICoreOptions } from "web3modal";
import create from "zustand";
import { persist } from "zustand/middleware";

import { formatAddress } from "./formatAddress";

// Fork of https://github.com/gimmixorg/use-wallet
// until my PRs are merged

type State = {
  provider: Web3Provider;
  account: Account;
  network: Network;
  web3Modal: Web3Modal;
};

const useStore = create<Partial<State>>(
  persist(
    (): Partial<State> => ({
      web3Modal: typeof window !== "undefined" ? new Web3Modal() : undefined,
    }),
    {
      name: "gimmix-wallet",
      partialize: ({ account }) => ({
        account,
      }),
    }
  )
);

type Account = string;
type ConnectWallet = (opts?: Partial<ICoreOptions>) => Promise<State>;
type DisconnectWallet = () => void;
type UseWallet = () => Partial<State> & {
  connect: ConnectWallet;
  disconnect: DisconnectWallet;
};

export const useWallet: UseWallet = () => {
  // Retreive the current values from the store, and automatically re-render on updates
  const account = useStore((state) => state.account);
  const network = useStore((state) => state.network);
  const provider = useStore((state) => state.provider);
  const web3Modal = useStore((state) => state.web3Modal);

  const disconnect: DisconnectWallet = useCallback(async () => {
    web3Modal?.clearCachedProvider();
    useStore.setState({
      provider: undefined,
      network: undefined,
      account: undefined,
    });
  }, [web3Modal]);

  const connect: ConnectWallet = useCallback(
    async (opts) => {
      // Launch modal with the given options
      const web3Modal = new Web3Modal(opts);
      const web3ModalProvider = await web3Modal.connect();

      // Set up Ethers provider and initial state with the response from the web3Modal
      const initialProvider = new Web3Provider(web3ModalProvider, "any");
      const getNetwork = () => initialProvider.getNetwork();
      const initialAccounts = await initialProvider.listAccounts();
      const initialNetwork = await getNetwork();

      const nextState = {
        web3Modal,
        provider: initialProvider,
        network: initialNetwork,
        account: formatAddress(initialAccounts[0]),
      };

      // Set up event listeners to handle state changes
      web3ModalProvider.on("accountsChanged", (accounts: string[]) => {
        console.log("walletProvider:accountsChanged", accounts);
        useStore.setState({ account: formatAddress(accounts[0]) });
      });

      web3ModalProvider.on("chainChanged", async (chainId: string) => {
        console.log("walletProvider:chainChanged", chainId);
        const network = await getNetwork();
        useStore.setState({ network });
      });

      web3ModalProvider.on("disconnect", () => {
        disconnect();
      });

      useStore.setState(nextState);
      return nextState;
    },
    [disconnect]
  );

  return {
    connect,
    provider,
    account,
    network,
    disconnect,
    web3Modal,
  };
};
