const hre = require("hardhat");
const MasterModule = require("../ignition/modules/Master");

async function main() {
  const { cc } = await hre.ignition.deploy(MasterModule);

  const masterAddress = await cc.getAddress();
  console.log(`Master deployed to: ${masterAddress}`);

  const Master = await hre.ethers.getContractFactory("Master");

  const masterContract = await Master.attach(masterAddress);

  const newVaultAddress = "0x4078685Eb9Bf27cE9d357ce4A2cDd3Ba1139C61E";
  const tx = await masterContract.setVault(newVaultAddress);

  await tx.wait();

  console.log(`Vault set to: ${newVaultAddress}`);
}

main().catch(console.error);


// npx hardhat ignition deploy ignition/modules/Master.js --network avalanche --verify