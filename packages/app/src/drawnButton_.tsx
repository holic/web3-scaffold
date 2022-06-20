import { toast } from "react-toastify";
import { useConnect } from "wagmi";

import { Button } from "./Button";
import { pluralize } from "./pluralize";
import { promiseNotify } from "./promiseNotify";
import { switchChain } from "./switchChain";
import { usePromiseFn } from "./usePromiseFn";

export const MintButton = () => {
  const { activeConnector } = useConnect();

  const [mintResult, mint] = usePromiseFn(
    async (onProgress: (message: string) => void) => {
      if (!activeConnector) {
        throw new Error("Wallet not connected");
      }

      // onProgress("Preparing wallet…");
      await switchChain(activeConnector);
      const signer = await activeConnector.getSigner();
    },
    [activeConnector]
  );

  return (
    <Button
      pending={mintResult.type === "pending"}
      onClick={(event) => {
        event.preventDefault();
        const toastId = toast.loading("Starting…");
        mint((message) => {
          toast.update(toastId, { render: message });
        }).then(
          () => {
            // TODO: show etherscan link?
            toast.update(toastId, {
              isLoading: false,
              type: "success",
              render: `Minted!`,
              autoClose: 5000,
              closeButton: true,
            });
          },
          (error) => {
            toast.update(toastId, {
              isLoading: false,
              type: "error",
              render: String(error.message),
              autoClose: 5000,
              closeButton: true,
            });
          }
        );
      }}
    >
      draw a canvas
    </Button>
  );
};
