const hre = require("hardhat");

async function main() {
  // BSC Deployments
  const bscVaultAddress = "0xD4289eeCf309745EB8c719D59Aa0D0a8820a6011";
  const bscMasterAddress = "0x4bc8312BCDABbAdB8eB28e0b924f52D16D2C3FfD";

  // Base Deployments
  const baseVaultAddress = "0xaD25F5F947783eb5dCfacFfCeA20B83F7aF4887B";
  const baseMasterAddress = "0xF47D69FD7Acff9766B6A27bD76A8FfEEeC2b6880";

  // Define gas price and max priority fee for BSC
  const gasOptions = {
    gasPrice: hre.ethers.parseUnits('5', 'gwei'),
  };

  console.log("Connecting to BSC contracts...");

  const BSC_Vault = await hre.ethers.getContractAt("Vault_CCIP", bscVaultAddress);
  const BSC_Master = await hre.ethers.getContractAt("Master", bscMasterAddress);

  // Call `changeMaster` on the BSC Vault contract to set the Base Master address
  console.log("Calling changeMaster on BSC Vault...");
  let tx = await BSC_Vault.changeMaster(baseMasterAddress, gasOptions);
  await tx.wait();
  console.log(`BSC Vault master set to: ${baseMasterAddress}`);

  // Call `setVault` on the BSC Master contract to set the Base Vault address
  console.log("Calling setVault on BSC Master...");
  tx = await BSC_Master.setVault(baseVaultAddress, gasOptions);
  await tx.wait();
  console.log(`BSC Master vault set to: ${baseVaultAddress}`);


  
  console.log("Connecting to Base contracts...");

  const Base_Vault = await hre.ethers.getContractAt("Vault_CCIP", baseVaultAddress);
  const Base_Master = await hre.ethers.getContractAt("Master", baseMasterAddress);

//   Call `changeMaster` on the Base Vault contract to set the BSC Master address
  console.log("Calling changeMaster on Base Vault...");
  tx = await Base_Vault.changeMaster(bscMasterAddress, gasOptions);
  await tx.wait();
  console.log(`Base Vault master set to: ${bscMasterAddress}`);

//   Call `setVault` on the Base Master contract to set the BSC Vault address
  console.log("Calling setVault on Base Master...");
  tx = await Base_Master.setVault(bscVaultAddress, gasOptions);
  await tx.wait();
  console.log(`Base Master vault set to: ${bscVaultAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
