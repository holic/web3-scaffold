type ChainConfig = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

export const chainConfig = (network: string): [number, ChainConfig] => {
  if (network === "matic") {
    const chainId = 137;
    return [
      chainId,
      {
        chainId: `0x${chainId.toString(16)}`,
        chainName: "Polygon Mainnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        rpcUrls: [
          "https://polygon-rpc.com/",
          "https://rpc-mainnet.matic.network",
          "https://matic-mainnet.chainstacklabs.com",
          "https://rpc-mainnet.maticvigil.com",
          "https://rpc-mainnet.matic.quiknode.pro",
          "https://matic-mainnet-full-rpc.bwarelabs.com",
        ],
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
    ];
  }

  if (network === "mumbai") {
    const chainId = 80001;
    return [
      chainId,
      {
        chainId: `0x${chainId.toString(16)}`,
        chainName: "Polygon Testnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18,
        },
        rpcUrls: [
          "https://rpc-mumbai.matic.today",
          "https://matic-mumbai.chainstacklabs.com",
          "https://rpc-mumbai.maticvigil.com/",
          "https://matic-testnet-archive-rpc.bwarelabs.com",
        ],
        blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
      },
    ];
  }

  throw new Error(`Unsupported network: ${network}`);
};
