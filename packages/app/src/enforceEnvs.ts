const enforceEnvs = () => {
  if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    throw Error(`Missing env var NEXT_PUBLIC_ALCHEMY_API_KEY`);
  }

  if (!process.env.NEXT_PUBLIC_INFURA_API_KEY) {
    throw Error(`Missing env var NEXT_PUBLIC_INFURA_API_KEY`);
  }

  if (!process.env.NEXT_PUBLIC_CHAIN_ID) {
    throw Error(`Missing env var NEXT_PUBLIC_CHAIN_ID`);
  }
};

export default enforceEnvs;
