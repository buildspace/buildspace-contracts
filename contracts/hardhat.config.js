require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');

const { RINKEBY_URL, RINKEBY_ACCOUNT, ETHERSCAN_API_KEY } = require('./.auth.rinkeby.js');
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.0',
  networks: {
    rinkeby: {
      url: RINKEBY_URL,
      accounts: [RINKEBY_ACCOUNT],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
};

//0x83F40A2F0bb814FC03D5B6C6B8166CfBe6794c35
//https://staging.tokens.buildspace.so/assets/
