const MasterModule = require("../ignition/modules/MasterModule");

async function main() {
  const { tl } = await hre.ignition.deploy(TokenLauncherModule);

  console.log(`TL deployed to: ${await tl.getAddress()}`);
}

main().catch(console.error);

// npx hardhat ignition deploy ignition/modules/TokenLauncher.js --network polygon --verify