require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');

require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
    },
  },
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
    },
    bsc: {
      url: "https://bsc-testnet-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.API_KEY_ETH,
  },
};
