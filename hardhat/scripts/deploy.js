const VaultModule = require("../ignition/modules/Vault");

async function main() {
  const { vault } = await hre.ignition.deploy(VaultModule);

  console.log(`Vault deployed to: ${await vault.getAddress()}`);
}

main().catch(console.error);

// npx hardhat ignition deploy ignition/modules/Vault.js --network avalanche --verify