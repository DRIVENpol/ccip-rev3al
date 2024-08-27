const MasterModule = require("../ignition/modules/Master");

async function main() {
  const { tl } = await hre.ignition.deploy(TokenLauncherModule);

  console.log(`TL deployed to: ${await tl.getAddress()}`);
}

main().catch(console.error);