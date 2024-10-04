const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MasterModule", (m) => {

  const cc = m.contract("Master");

  return { cc };
});