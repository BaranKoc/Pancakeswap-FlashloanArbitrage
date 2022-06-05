require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  networks: {
    dev:{
      url: process.env.testnet_url,
      gas: 6721975,
      gasPrice: 20000000000
    }
  },

  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.6.7",
      },
    ],
  },

  paths: {
    sources: "src/blockchain/contracts",
    tests: "src/blockchain/test",
    cache: "src/blockchain/cache",
    artifacts: "src/blockchain/artifacts"
  },

  mocha: {
    timeout: 70000
  }
};