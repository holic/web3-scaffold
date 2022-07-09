import React from "react";
import { useAccount } from "wagmi";
// import { useENS } from "../useENS";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Button from "./Button";

const Footer = () => {
  const { data: account } = useAccount();
  // const ensName = useENS(account?.address || "");

  return (
    <div className="flex text-white font-mono text-2xl justify-center items-center cursor-pointer bottom-2 absolute text-base">
      <div className="flex justify-center items-end flex-">
        {account && (
          <ConnectButton.Custom>
            {({ openAccountModal }) => (
              <Button
                className="text-gray-400 bg-transparent"
                onClick={openAccountModal}
              >
                logout
              </Button>
            )}
          </ConnectButton.Custom>
        )}
      </div>
    </div>
  );
};

export default Footer;
