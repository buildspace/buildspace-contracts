const Ethers = require('ethers');
const { ethers } = Ethers;
const QRCode = require('qrcode');
const WalletConnectProvider = require('@walletconnect/web3-provider').default;
const { abi, bytecode } = require('../artifacts/contracts/Buildspace.sol/Buildspace.json');
const config = require('../.auth.config.js');

const NETWORK = 'RINKEBY';

console.log('Params: ', config[NETWORK]);

async function main() {
  const provider = new WalletConnectProvider({
    infuraId: config[NETWORK].INFURA_ID,
    qrcode: false,
  });

  provider.connector.on('display_uri', async (err, payload) => {
    const uri = payload.params[0];
    const code = await QRCode.toString(uri, { type: 'terminal' });
    console.log(code);
  });

  await provider.enable();

  const web3Provider = new ethers.providers.Web3Provider(provider);
  const deployer = await web3Provider.getSigner();

  console.log('Deploying contracts with the account:', await deployer.getAddress());
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Token = new ethers.ContractFactory(abi, bytecode, deployer);
  const token = await Token.deploy(config[NETWORK].BASE_TOKEN_URI);

  console.log('Token address:', token.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
