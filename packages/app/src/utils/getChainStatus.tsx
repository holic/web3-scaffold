// Note: If RainbowKit ever adds more chain status options, add them here.
const chainStatuses = ["full", "icon", "name", "none"] as const;
type ChainStatus = typeof chainStatuses[number];

const isValidChainStatus = (value: string): value is ChainStatus => {
  return chainStatuses.includes(value as ChainStatus);
};

export const getChainStatus = (): ChainStatus => {
  return process.env.NEXT_PUBLIC_CHAIN_STATUS &&
    isValidChainStatus(process.env.NEXT_PUBLIC_CHAIN_STATUS)
    ? process.env.NEXT_PUBLIC_CHAIN_STATUS
    : "icon";
};
