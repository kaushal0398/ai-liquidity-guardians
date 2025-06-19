import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  const tokenA = process.env.TOKEN_A!;
  const tokenB = process.env.TOKEN_B!;

  const Pool = await ethers.getContractFactory("SimpleLiquidityPool");
  const pool = await Pool.deploy(tokenA, tokenB);
  await pool.deployed();

  console.log("✅ Liquidity pool deployed to:", pool.address);
}

main().catch(console.error);
