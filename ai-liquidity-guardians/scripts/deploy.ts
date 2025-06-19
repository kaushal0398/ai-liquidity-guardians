import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  const router = process.env.ROUTER!;
  const keeper = deployer.address;
  const priceFeed = process.env.PRICE_FEED!;

  const Vault = await ethers.getContractFactory("SmartLiquidityVault");
  const vault = await Vault.deploy(router, keeper, priceFeed);
  await vault.deployed();

  console.log("✅ Vault deployed to:", vault.address);
}

main().catch(console.error);
