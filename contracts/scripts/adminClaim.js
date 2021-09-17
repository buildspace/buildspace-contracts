const Ethers = require('ethers');
const { ethers } = Ethers;
const QRCode = require('qrcode');
const WalletConnectProvider = require('@walletconnect/web3-provider').default;
const { abi, bytecode } = require('../artifacts/contracts/Buildspace.sol/Buildspace.json');
const config = require('../.auth.config.js');
const deployMetadata = require('../.auth.users.js');

const NETWORK = 'MAINNET';

console.log('Params: ', config[NETWORK]);
console.log('Users: ', deployMetadata.addresses.length);

async function adminClaim() {
  const provider = new WalletConnectProvider({
    infuraId: config[NETWORK].INFURA_ID,
    qrcode: false,
    clientMeta: {
      name: 'Buildspace',
      url: 'https://buildspace.so',
    },
  });

  provider.connector.on('display_uri', async (err, payload) => {
    const uri = payload.params[0];
    console.log(uri);
    const code = await QRCode.toString(uri, { type: 'terminal' });
    console.log(code);
  });

  provider.connector.on('connect', async (err, payload) => {
    console.log(payload);
  });

  provider.connector.on('disconnect', async (err, payload) => {
    console.log(payload);
  });

  provider.connector.on('session_request', async (err, payload) => {
    console.log(payload);
  });

  await provider.enable();

  const web3Provider = new ethers.providers.Web3Provider(provider);
  const deployer = await web3Provider.getSigner();
  console.log('Deployer: ', deployer);
  const Token = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = Token.attach(config[NETWORK].CONTRACT_ADDRESS);

  for (const userAddress of deployMetadata.addresses) {
    console.log('Start Address: ', userAddress);
    const res = await contract['adminClaimToken'](deployMetadata.cohortId, userAddress);
    console.log('Finish Address: ', userAddress);

    console.log(res);
  }
}

adminClaim()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
