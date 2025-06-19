import { ethers } from "ethers";
import * as dotenv from "dotenv";
import vaultAbi from "../artifacts/contracts/SmartLiquidityVault.sol/SmartLiquidityVault.json";
dotenv.config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = provider.getSigner(0);

  const vault = new ethers.Contract(process.env.VAULT!, vaultAbi.abi, signer);
  const user = process.env.USER!;

  const config = await vault.vaults(user);
  const entry = Number(config.entryPrice);
  const latest = Number(await vault.getLatestPrice());
  const change = ((latest - entry) * 100) / entry;

  console.log("📉 Price Δ:", change.toFixed(2), "%");

  if (change >= config.takeProfit || change <= config.stopLoss) {
    console.log("🚨 Triggering exitVault()");
    await vault.exitVault(user, 0, 0);
  } else {
    console.log("✅ Still in range, no action");
  }
}

main().catch(console.error);
