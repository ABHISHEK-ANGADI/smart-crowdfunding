require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Local development network (Hardhat's built-in node)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      // Accounts are automatically provided by the Hardhat node
    },

    // Local Ganache (if you decide to use it later)
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      // You'll need to provide private keys from Ganache here
      // accounts: [process.env.GANACHE_PRIVATE_KEY],
    },

    // Sepolia Testnet (for future deployment)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },

  // For gas reporting (optional)
  gasReporter: {
    enabled: false,
    currency: "USD",
  },

  // For contract verification on Etherscan (optional)
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  mocha: {
    timeout: 40000,
  },
};