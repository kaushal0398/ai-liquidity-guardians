import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [user] = await ethers.getSigners();

  const poolAddress = process.env.POOL!;
  const tokenA = await ethers.getContractAt("MockERC20", process.env.TOKEN_A!);
  const tokenB = await ethers.getContractAt("MockERC20", process.env.TOKEN_B!);
  const pool = await ethers.getContractAt("SimpleLiquidityPool", poolAddress);

  const amount = ethers.utils.parseEther("100");

  await tokenA.connect(user).approve(pool.address, amount);
  await tokenB.connect(user).approve(pool.address, amount);

  const tx = await pool.connect(user).provideLiquidity(amount, amount);
  await tx.wait();

  console.log("✅ Provided liquidity to the pool");
}

main().catch(console.error);
