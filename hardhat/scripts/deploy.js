const hre = require("hardhat");
const VaultModule = require("../ignition/modules/VaultModule");
const MasterModule = require("../ignition/modules/MasterModule");

async function main() {
  // Deploy the Vault contract
  const { vault } = await hre.ignition.deploy(VaultModule);
  const vaultAddress = await vault.getAddress();
  console.log(`Vault deployed to: ${vaultAddress}`);

  // Deploy the Master contract
  const { cc } = await hre.ignition.deploy(MasterModule);
  const masterAddress = await cc.getAddress();
  console.log(`Master deployed to: ${masterAddress}`);
}

main().catch(console.error);
