import { chain } from "wagmi";

const isValidChain = (value: string): value is keyof typeof chain => {
  return [
    "mainnet",
    "ropsten",
    "rinkeby",
    "goerli",
    "kovan",
    "optimism",
    "optimismKovan",
    "polygon",
    "polygonMumbai",
    "arbitrum",
    "arbitrumRinkeby",
    "localhost",
    "hardhat",
    "foundry",
  ].includes(value);
};

export const getChainSlugs = () => {
  const targetChainSlugs = process.env.NEXT_PUBLIC_CHAIN_SLUGS
    ? process.env.NEXT_PUBLIC_CHAIN_SLUGS.split(",").map((slug) => slug.trim())
    : ["goerli", "mainnet"];
  return targetChainSlugs.filter(isValidChain);
};

export const getChains = () => {
  const chainSlugs = getChainSlugs();
  return chainSlugs.map((chainSlug) => chain[chainSlug]);
};
