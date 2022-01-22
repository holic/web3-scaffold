import type { ContractTransaction } from "@ethersproject/contracts";
import { Web3Provider } from "@ethersproject/providers";
import createDebug from "debug";
import { useCallback } from "react";
import createStore from "zustand";

import { chainConfig } from "./chainConfig";
import { useWallet } from "./useWallet";

const debug = createDebug("app:useTransaction");

const [chainId, chain] = chainConfig(
  process.env.NODE_ENV === "production" ? "matic" : "mumbai"
);

export enum WalletState {
  idle = "idle",
  connectingWallet = "connectingWallet",
  switchingNetwork = "switchingNetwork",
  addingNetwork = "addingNetwork",
  sendingTransaction = "sendingTransaction",
  confirmingTransaction = "confirmingTransaction",
}

type State = {
  walletState: WalletState;
  walletError: any | null;
};

const useStore = createStore<State>(() => ({
  walletState: WalletState.idle,
  walletError: null,
}));

export const useTransaction = (
  createTransaction: (provider: Web3Provider) => Promise<ContractTransaction>
) => {
  const { provider, connect } = useWallet();
  const { walletState, walletError } = useStore();

  // TODO: don't send transaction if wallet is in a non-idle state?
  // TODO: catch errors and build better messages

  const sendTransaction = useCallback(async (): Promise<boolean> => {
    let currentProvider = provider;

    if (!currentProvider) {
      debug("no provider, connecting to wallet");
      useStore.setState({ walletState: WalletState.connectingWallet });
      try {
        const connectState = await connect();
        debug("got connect state", connectState);
        currentProvider = connectState.provider;
      } catch (walletError: any) {
        // ugh, web3modal doesn't emit an error properly when you cancel
        // a connect wallet request
        // https://github.com/Web3Modal/web3modal/pull/300
        if (typeof walletError === "undefined") {
          debug("probably cancelled in metamask, returning generic error");
          walletError = new Error("Could not connect to wallet");
        }
        useStore.setState({ walletState: WalletState.idle, walletError });
        return false;
      }
    }

    // TODO: check this for metamask-provided chain IDs (doing just add and not switch gave an error)
    debug("asking wallet to add/switch network");
    useStore.setState({ walletState: WalletState.switchingNetwork });
    try {
      await currentProvider.send("wallet_switchEthereumChain", [
        { chainId: chain.chainId },
      ]);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await currentProvider.send("wallet_addEthereumChain", [chain]);
          // Immediately check if the network is correct, because web3modal
          // doesn't throw if the network switch is cancelled from above call
          // https://github.com/Web3Modal/web3modal/issues/363
          const currentNetwork = await currentProvider.getNetwork();
          if (currentNetwork.chainId !== chainId) {
            throw new Error(
              `You must switch your wallet to ${chain.chainName}`
            );
          }
        } catch (walletError: any) {
          useStore.setState({ walletState: WalletState.idle, walletError });
          return false;
        }
      } else {
        throw switchError;
      }
    }

    debug("asking wallet to send transaction");
    useStore.setState({ walletState: WalletState.sendingTransaction });
    let tx: ContractTransaction;
    try {
      tx = await createTransaction(currentProvider);
    } catch (walletError: any) {
      console.log("got error", walletError);
      useStore.setState({ walletState: WalletState.idle, walletError });
      return false;
    }

    debug("waiting for transaction confirmations");
    useStore.setState({ walletState: WalletState.confirmingTransaction });
    try {
      await tx.wait();
    } catch (walletError: any) {
      useStore.setState({ walletState: WalletState.idle, walletError });
      return false;
    }

    debug("transaction complete!");
    useStore.setState({ walletState: WalletState.idle, walletError: null });
    return true;
  }, [connect, createTransaction, provider]);

  return { sendTransaction, walletState, walletError };
};

// if (currentProvider.network.chainId !== chainId) {
//   debug("wrong network, asking wallet to switch");
//   try {
//     useStore.setState({ walletState: WalletState.switchingNetwork });
//     await currentProvider.send("wallet_switchEthereumChain", [
//       { chainId: chain.chainId },
//     ]);
//   } catch (error: any) {
//     if (error.code === 4902) {
//       useStore.setState({ walletState: WalletState.addingNetwork });
//       await currentProvider.send("wallet_addEthereumChain", [chain]);
//     } else {
//       useStore.setState({ walletState: WalletState.idle, walletError });
//       return;
//     }
//   }
// }
