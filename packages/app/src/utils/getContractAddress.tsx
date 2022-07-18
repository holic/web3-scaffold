export const getContractAddress = (): string => {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    : "0xe584409f2ba1ade9895485d90587fd46baa3c0d8";
};
