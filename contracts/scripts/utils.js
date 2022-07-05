const Ethers = require('ethers');
const { ethers } = Ethers;
const {
  abi,
  bytecode,
} = require('../artifacts/contracts/Buildspace.sol/Buildspace.json');
const config = require('../.auth.config.js');

const NETWORK = 'MATIC';

const web3Provider = new ethers.providers.JsonRpcProvider(
  config[NETWORK].NODE_URL
);
const deployer = new ethers.Wallet(config[NETWORK].PRIVATE_KEY, web3Provider);
const contract = new ethers.Contract(
  config[NETWORK].CONTRACT_ADDRESS,
  abi,
  deployer
);

async function main() {
  console.log(
    'Deploying contracts with the account:',
    await deployer.getAddress()
  );
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Token = new ethers.ContractFactory(abi, bytecode, deployer);
  const token = await Token.deploy(config[NETWORK].BASE_TOKEN_URI);

  console.log('Token address:', token.address);
}

// Helpers

/**
 * @param number nonce
 * @param string gasPrice
 * If a transaction is stuck, you can use this function to cancel that transaction as long as the gasPrice value is larger
 */
const cancelTransaction = async (nonce, gasPrice) => {
  const tx = await deployer.sendTransaction({
    to: config[NETWORK].CONTRACT_ADDRESS,
    value: 0,
    nonce: nonce,
    gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei'),
    gasLimit: 100000,
  });

  console.log(tx);
  console.log('done!');
};

/**
 * @param string cohortId
 * Fetches the cohort on the contract and prints out the Limit number of the cohort
 */
const fetchCohort = async (cohortId) => {
  const tx = await contract.cohorts(cohortId);
  console.log(tx);
  console.log('LIMIT:', tx[0].toNumber());
};

/**
 * @param number tokenId
 * Fetches the URI of the given tokenId
 */
const fetchUri = async (tokenId) => {
  const tx = await contract.tokenURI(tokenId);
  console.log(tx);
};

/**
 * @param string cohortId
 * @param string merkleRoot
 * @param string gasPrice
 * Updates the merkle root with new root value for a given cohort
 */
const updateMerkleRoot = async (cohortId, merkleRoot, gasPrice) => {
  const tx = await contract.setMerkleRoot(cohortId, merkleRoot, {
    gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei'),
  });
  console.log(tx);
  await tx.wait();
};

/**
 * @param string cohort_id
 * @param number limit
 * @param string gasPrice
 * Creates a new cohort on the contract with an initial merkle root
 */
const createCohort = async (cohort_id, limit, gasPrice) => {
  const tx = await contract.createCohort(
    cohort_id,
    limit,
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    {
      gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei'),
      gasLimit: 100000,
    }
  );
  console.log(tx);
  await tx.wait();
};

/**
 * @param string address
 * @param string cohort_id
 * Fetches the token number of a given cohort_id and address
 */
const fetchOwner = async (address, cohort_id) => {
  const tx = await contract.claimed(address, cohort_id);
  console.log(tx.toNumber());
};

// Execution Land
createCohort('CHaee9050e-fdb6-4094-9097-7f4fa00b8fd6', 1000, '100')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
