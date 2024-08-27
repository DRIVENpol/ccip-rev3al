const MasterModule = require("../ignition/modules/Master");

async function main() {
  const { cc } = await hre.ignition.deploy(MasterModule);

  console.log(`Master deployed to: ${await cc.getAddress()}`);
}

main().catch(console.error);