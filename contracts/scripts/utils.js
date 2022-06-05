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

async function cancelTransaction(nonce) {
  const tx = await deployer.sendTransaction({
    to: config[NETWORK].CONTRACT_ADDRESS,
    value: 0,
    nonce: nonce,
    gasPrice: ethers.utils.parseUnits('170', 'gwei'),
    gasLimit: 100000,
  });

  console.log(tx);
  // await tx.wait();
  console.log('done!');
}

async function createCohort(cohortId, limit, merkleRoot) {
  const tx = await contract.createCohort(cohortId, limit, merkleRoot, {
    gasPrice: ethers.utils.parseUnits('100', 'gwei'),
  });
  console.log(tx);
  await tx.wait();
}

async function fetchCohort(cohortId) {
  const tx = await contract.cohorts(cohortId);
  console.log(tx);
  console.log('LIMIT:', tx[0].toNumber());
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
      gasPrice: ethers.utils.parseUnits('100', 'gwei'),
      gasLimit: 100000,
    }
  );
  console.log(tx);
  await tx.wait();
}

async function fetchOwner(address) {
  const tx = await contract.claimed(
    address,
    'CH4f447780-07cf-408a-8f4c-253a8b4e8bae'
  );
  console.log(tx);
  return tx;
}

//-- EXECUTION LAND --//

// fetchOwner('0xE43973F95F344A1178CA661440E6A1F0d0a854B6')
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//   });

// fetchUri(14629)
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//   });

// const runAction = async () => {
//   for (let i = 83854; i++; i < 83884) {
//     await cancelTransaction(i);
//     console.log('done');
//   }
// };

// runAction();

createCohort('CHa07ac83b-bc08-46b6-b561-abe05d5bda00', 1000)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// fetchCohort('CHe6f2f7a0-e85f-443e-95a6-28d143bc0d6d')
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

// fetchUri('5579')
// .then(() => process.exit(0))
// .catch(error => {
//   console.error(error);
//   process.exit(1);
// });
