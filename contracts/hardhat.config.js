require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');

const config = require('./.auth.config.js');

module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: config.RINKEBY.NODE_URL,
    },
    mainnet: {
      url: config.MAINNET.NODE_URL,
    },
    matic: {
      url: config.MATIC.NODE_URL,
    },
  },
  etherscan: {
    apiKey: config.MAINNET.ETHERSCAN_API_KEY,
  },
};
