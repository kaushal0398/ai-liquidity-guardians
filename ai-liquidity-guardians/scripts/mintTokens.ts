import { ethers } from "hardhat";
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const tokenA = await ethers.getContractAt("MockERC20", process.env.TOKEN_A!);
  const tokenB = await ethers.getContractAt("MockERC20", process.env.TOKEN_B!);

  const amount = ethers.utils.parseUnits("1000", 18);
  await tokenA.mint(deployer.address, amount);
  await tokenB.mint(deployer.address, amount);

  console.log("✅ Minted 1000 tokens to", deployer.address);
}

main().catch(console.error);
