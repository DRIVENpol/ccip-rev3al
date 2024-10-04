const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const MasterModule = require("./MasterModule");
const VaultModule = require("./VaultModule");

module.exports = buildModule("CombinedModule", (m) => {
  const { vault } = m.useModule(VaultModule);
  const { cc } = m.useModule(MasterModule);

  return { vault, cc };
});