import { ethers } from "ethers";
import express from "express";
import dotenv from "dotenv";
import vaultAbi from "../artifacts/contracts/SmartLiquidityVault.sol/SmartLiquidityVault.json";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const VAULT_ADDRESS = process.env.VAULT_ADDRESS!;
const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi.abi, signer);

const app = express();
app.use(express.json());

const vaultUsers = [process.env.USER_ADDRESS!];

const PRICE_FEED_URL = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

async function getEthPriceUSD(): Promise<number> {
  const res = await fetch(PRICE_FEED_URL);
  const data = await res.json();
  return data.ethereum.usd;
}

function percentChange(current: number, entry: number): number {
  return ((current - entry) / entry) * 100;
}

async function monitorVaults(trigger?: string) {
  const ethPrice = await getEthPriceUSD();

  for (const user of vaultUsers) {
    const config = await vault.vaults(user);
    if (!config.active) continue;

    const change = percentChange(ethPrice, Number(config.entryPrice));

    if (trigger === "predictive-take-profit" || change >= config.takeProfit) {
      console.log(`🟢 TP hit for ${user}, exiting...`);
      await vault.exitVault(user, 0, 0);
      await vault.markTrigger(user, "TP or Predictive TP");
    } else if (trigger === "predictive-stop-loss" || change <= config.stopLoss) {
      console.log(`🔴 SL hit for ${user}, exiting...`);
      await vault.exitVault(user, 0, 0);
      await vault.markTrigger(user, "SL or Predictive SL");
    } else {
      console.log(`🔄 ${user}: price change ${change.toFixed(2)}% - no action`);
    }
  }
}

app.post("/trigger", async (req, res) => {
  const { trigger } = req.body;
  console.log("📥 Agent Trigger Received:", trigger);
  await monitorVaults(trigger);
  res.json({ status: "executed", trigger });
});

app.listen(3001, () => {
  console.log("✅ Keeper API listening on http://localhost:3001");
});

// Manual run
monitorVaults().catch(console.error);
