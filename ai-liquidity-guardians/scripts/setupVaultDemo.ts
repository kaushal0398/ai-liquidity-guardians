import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [user] = await ethers.getSigners();

  // --- Deploy Tokens ---
  const Token = await ethers.getContractFactory("MockERC20");
  const tokenA = await Token.deploy("Token A", "TKA", 18);
  await tokenA.deployed();

  const tokenB = await Token.deploy("Token B", "TKB", 18);
  await tokenB.deployed();

  console.log("✅ TokenA:", tokenA.address);
  console.log("✅ TokenB:", tokenB.address);

  // --- Deploy Pool ---
  const Pool = await ethers.getContractFactory("SimpleLiquidityPool");
  const pool = await Pool.deploy(tokenA.address, tokenB.address);
  await pool.deployed();

  console.log("✅ Liquidity Pool:", pool.address);

  // --- Deploy Mock Price Feed ---
  const PriceFeed = await ethers.getContractFactory("MockV3Aggregator");
  const priceFeed = await PriceFeed.deploy(8, 2000e8); // price = $2000 * 10^8
  await priceFeed.deployed();

  console.log("✅ Mock Price Feed:", priceFeed.address);

  // --- Deploy Vault ---
  const Vault = await ethers.getContractFactory("SmartLiquidityVault");
  const vault = await Vault.deploy(pool.address, user.address, priceFeed.address);
  await vault.deployed();

  console.log("✅ Vault:", vault.address);

  // --- Mint Tokens ---
  const mintAmt = ethers.utils.parseEther("1000");
  await tokenA.mint(user.address, mintAmt);
  await tokenB.mint(user.address, mintAmt);
  console.log("✅ Minted tokens");

  // --- Provide Liquidity ---
  const lpAmt = ethers.utils.parseEther("500");
  await tokenA.approve(pool.address, lpAmt);
  await tokenB.approve(pool.address, lpAmt);
  await pool.provideLiquidity(lpAmt, lpAmt);
  console.log("✅ Provided liquidity");

  // --- Enter Vault ---
  await tokenA.approve(vault.address, lpAmt);
  await tokenB.approve(vault.address, lpAmt);
  await vault.enterVault(
    tokenA.address,
    tokenB.address,
    pool.address,
    lpAmt,
    -10,  // Stop Loss: -10%
    15,   // Take Profit: +15%
    true  // Auto Re-enter: YES
  );
  console.log("✅ Entered vault");

  // --- Write Addresses to .env.localhost ---
  const envPath = path.resolve(__dirname, "../.env");
  const envContent = `
TOKEN_A=${tokenA.address}
TOKEN_B=${tokenB.address}
POOL=${pool.address}
VAULT=${vault.address}
PRICE_FEED=${priceFeed.address}
USER=${user.address}
`.trim();

  fs.writeFileSync(envPath, envContent);
  console.log("✅ Wrote .env file with addresses");
}

main().catch(console.error);
