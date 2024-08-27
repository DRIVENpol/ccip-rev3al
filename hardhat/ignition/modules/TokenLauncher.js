const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenLauncherModule", (m) => {

  const tl = m.contract("TokenLauncher");

  return { tl };
});
