import React from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Button from "./Button";

const Footer = () => {
  const { isConnected } = useAccount();

  return (
    <div className="w-full flex flex-col text-white font-mono text-2xl justify-center items-center cursor-pointer bottom-0 absolute text-base select-none">
      <div className="flex justify-center items-end">
        {isConnected && (
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
