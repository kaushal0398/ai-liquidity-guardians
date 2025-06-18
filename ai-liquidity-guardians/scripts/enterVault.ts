import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [user] = await ethers.getSigners();

  const vault = await ethers.getContractAt("SmartLiquidityVault", process.env.VAULT!);
  const tokenA = await ethers.getContractAt("MockERC20", process.env.TOKEN_A!);
  const tokenB = await ethers.getContractAt("MockERC20", process.env.TOKEN_B!);

  const amount = ethers.utils.parseEther("100");

  await tokenA.connect(user).approve(vault.address, amount);
  await tokenB.connect(user).approve(vault.address, amount);

  await vault.connect(user).enterVault(
    tokenA.address,
    tokenB.address,
    process.env.POOL!,
    amount,
    -10,
    15,
    true
  );

  console.log("✅ Entered vault");
}

main().catch(console.error);

