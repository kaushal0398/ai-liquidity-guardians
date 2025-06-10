import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with address:", deployer.address);

  const routerAddress = "<UNISWAP_ROUTER_ADDRESS>"; // e.g., Sushi/UniV2 router on Sepolia
  const keeperAddress = deployer.address; // For now, deployer is keeper

  const Vault = await ethers.getContractFactory("SmartLiquidityVault");
  const vault = await Vault.deploy(routerAddress, keeperAddress);
  await vault.deployed();

  console.log("✅ Vault deployed to:", vault.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
