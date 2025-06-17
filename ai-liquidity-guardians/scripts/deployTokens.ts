import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("MockERC20");

  const tokenA = await Token.deploy("Token A", "TKA", 18);
  const tokenB = await Token.deploy("Token B", "TKB", 18);

  await tokenA.deployed();
  await tokenB.deployed();

  console.log("Token A deployed to:", tokenA.address);
  console.log("Token B deployed to:", tokenB.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
