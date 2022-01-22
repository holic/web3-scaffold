import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";

import dotenv from "dotenv";

dotenv.config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: false,
        interval: 1000,
      },
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_URL,
      accounts: [process.env.POLYGON_MUMBAI_DEPLOYER_PRIVATE_KEY],
    },
    rinkeby: {
      url: process.env.ETHEREUM_RINKEBY_URL,
      accounts: [process.env.ETHEREUM_RINKEBY_DEPLOYER_PRIVATE_KEY],
    },
    matic: {
      url: process.env.POLYGON_MAINNET_URL,
      accounts: [process.env.POLYGON_MAINNET_DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 100,
    token: "MATIC",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};
