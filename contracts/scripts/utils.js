const Ethers = require('ethers');
const { ethers } = Ethers;
const { abi, bytecode } = require('../artifacts/contracts/Buildspace.sol/Buildspace.json');
const config = require('../.auth.config.js');

const NETWORK = 'MATIC';

const web3Provider = new ethers.providers.JsonRpcProvider(config[NETWORK].NODE_URL);
const deployer = new ethers.Wallet(config[NETWORK].PRIVATE_KEY, web3Provider);
const contract = new ethers.Contract(config[NETWORK].CONTRACT_ADDRESS, abi, deployer);

async function main() {
  console.log('Deploying contracts with the account:', await deployer.getAddress());
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Token = new ethers.ContractFactory(abi, bytecode, deployer);
  const token = await Token.deploy(config[NETWORK].BASE_TOKEN_URI);

  console.log('Token address:', token.address);
}

async function createCohort(cohortId, limit, merkleRoot) {
  const tx = await contract.createCohort(cohortId, limit, merkleRoot, {
    gasPrice: ethers.utils.parseUnits('100', 'gwei'),
  });
  console.log(tx);
  await tx.wait();
}

async function fetchUri(tokenId) {
  const tx = await contract.tokenURI(tokenId);
  console.log(tx);
}

async function updateMerkleRoot(cohortId, merkleRoot) {
  const tx = await contract.setMerkleRoot(cohortId, merkleRoot, {
    gasPrice: ethers.utils.parseUnits('50', 'gwei'),
  });
  console.log(tx);
  await tx.wait();
}

async function createCohort(cohort_id, limit) {
  const tx = await contract.createCohort(
    cohort_id,
    limit,
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    {
      gasPrice: ethers.utils.parseUnits('50', 'gwei'),
    }
  );
  console.log(tx);
  await tx.wait();
}

fetchUri('0')
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
