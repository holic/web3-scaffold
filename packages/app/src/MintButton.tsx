import { toast } from "react-toastify";
import { useConnect } from "wagmi";

import { Button } from "./Button";
import { dailyCanvasContract, usedailyCanvasContractRead } from "./contracts";
// import { extractContractError } from "./extractContractError";
import { pluralize } from "./pluralize";
import { promiseNotify } from "./promiseNotify";
import { switchChain } from "./switchChain";
import { usePromiseFn } from "./usePromiseFn";

export const MintButton = () => {
  // const { activeConnector } = useConnect();
  // const [mintResult, mint] = usePromiseFn(
  //   async (onProgress: (message: string) => void) => {
  //     if (!activeConnector) {
  //       throw new Error("Wallet not connected");
  //     }
  //     const pixelFilled = true;
  //     onProgress("Preparing wallet…");
  //     await switchChain(activeConnector);
  //     const signer = await activeConnector.getSigner();
  //     const contract = dailyCanvasContract.connect(signer);
  //     const currentPromptId = dailyCanvasContract.getCurrentPromptId();
  //     try {
  //       onProgress(`Minting ${pluralize(1, "token", "tokens")}…`);
  //       const tx = await promiseNotify(
  //         contract.drawCanvas(pixelFilled, currentPromptId)
  //       ).after(1000 * 5, () =>
  //         onProgress("Please confirm transaction in your wallet…")
  //       );
  //       console.log("mint tx", tx);
  //       onProgress("Finalizing transaction…");
  //       const receipt = await promiseNotify(tx.wait())
  //         .after(1000 * 15, () =>
  //           onProgress(
  //             "It can sometimes take a while to finalize a transaction…"
  //           )
  //         )
  //         .after(1000 * 30, () => onProgress("Still working on it…"));
  //       console.log("mint receipt", receipt);
  //       return { receipt };
  //     } catch (error) {
  //       console.error("Transaction error:", error);
  //       // const contractError = extractContractError(error);
  //       throw new Error(`Transaction error: {contractError}`);
  //     }
  //   },
  //   [activeConnector]
  // );
  // return (
  //   <Button
  //     pending={mintResult.type === "pending"}
  //     onClick={(event) => {
  //       event.preventDefault();
  //       const toastId = toast.loading("Starting…");
  //       mint((message) => {
  //         toast.update(toastId, { render: message });
  //       }).then(
  //         () => {
  //           // TODO: show etherscan link?
  //           toast.update(toastId, {
  //             isLoading: false,
  //             type: "success",
  //             render: `Minted!`,
  //             autoClose: 5000,
  //             closeButton: true,
  //           });
  //         },
  //         (error) => {
  //           toast.update(toastId, {
  //             isLoading: false,
  //             type: "error",
  //             render: String(error.message),
  //             autoClose: 5000,
  //             closeButton: true,
  //           });
  //         }
  //       );
  //     }}
  //   >
  //     draw a canvas
  //   </Button>
  // );
};
