const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VaultModule", (m) => {

  const vault = m.contract("Vault_CCIP");

  return { vault };
});
