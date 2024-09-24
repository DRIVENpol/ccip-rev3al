const hre = require("hardhat");
const MasterModule = require("../ignition/modules/Master");

async function main() {
  // Deploy the contract using Ignition
  const { cc } = await hre.ignition.deploy(MasterModule);

  // Get the deployed contract address
  const masterAddress = await cc.getAddress();
  console.log(`Master deployed to: ${masterAddress}`);

  // Get the contract factory for Master to create a contract instance
  const Master = await hre.ethers.getContractFactory("Master");

  // Create a contract instance to interact with the deployed contract
  const masterContract = await Master.attach(masterAddress);

  // Call the setVault function
  const newVaultAddress = "0x4078685Eb9Bf27cE9d357ce4A2cDd3Ba1139C61E"; // Replace with the actual vault address
  const tx = await masterContract.setVault(newVaultAddress);

  // Wait for the transaction to be mined
  await tx.wait();

  console.log(`Vault set to: ${newVaultAddress}`);
}

main().catch(console.error);


// npx hardhat ignition deploy ignition/modules/Master.js --network avalanche --verify