import { useAccount, useContract, useProvider, useSigner } from "wagmi";
import MinimalForwarder from "@web3-scaffold/contracts/deploys/goerli/MinimalForwarder.json";
import DailyCanvas from "@web3-scaffold/contracts/deploys/rinkeby/DailyCanvas.json";

import {
  DailyCanvas__factory,
  MinimalForwarder__factory,
} from "../types/factories";
import { useMemo } from "react";

const usePreparedMetaTransaction = (data: any[]) => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const account = useAccount();

  const forwarderContract = useContract({
    addressOrName: MinimalForwarder.deployedTo,
    contractInterface: MinimalForwarder__factory.abi,
    signerOrProvider: signer,
  });

  const dailyCanvasContract = useContract({
    addressOrName: DailyCanvas.deployedTo,
    contractInterface: DailyCanvas__factory.abi,
  });

  const encodedData = useMemo(
    () => dailyCanvasContract.interface.encodeFunctionData("drawCanvas", data),
    [dailyCanvasContract.interface, data]
  );

  console.log("encodedData", encodedData);

  const signatureData = {
    to: DailyCanvas.deployedTo,
    from: account.address,
    data: encodedData,
  };

  console.log("signatureData", signatureData);

  const nonce = useMemo(
    () => signer?.getTransactionCount().then((val) => val),
    [signer]
  );
  console.log("nonce", nonce);

  // get the nonce
};

export default usePreparedMetaTransaction;
