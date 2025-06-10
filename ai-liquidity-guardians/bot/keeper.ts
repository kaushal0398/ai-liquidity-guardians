import { ethers } from "ethers";
import dotenv from "dotenv";
import vaultAbi from "../artifacts/contracts/SmartLiquidityVault.sol/SmartLiquidityVault.json";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const VAULT_ADDRESS = "<DEPLOYED_CONTRACT_ADDRESS_HERE>";
const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi.abi, signer);

const PRICE_FEED_URL = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

// Simulate fetching user config (mocked for now)
const vaultUsers = ["<USER_ADDRESS_HERE>"];

async function getEthPriceUSD(): Promise<number> {
  const res = await fetch(PRICE_FEED_URL);
  const data = await res.json();
  return data.ethereum.usd;
}

function percentChange(current: number, entry: number): number {
  return ((current - entry) / entry) * 100;
}

async function monitorVaults() {
  const ethPrice = await getEthPriceUSD();

  for (const user of vaultUsers) {
    const config = await vault.vaults(user);
    if (!config.active) continue;

    const change = percentChange(ethPrice, Number(config.entryPrice));

    if (change >= config.takeProfit) {
      console.log(`🟢 TP hit for ${user}, exiting...`);
      await vault.exitVault(user, 0, 0); // Assume 0 min amounts
      await vault.markTrigger(user, "TP");
    } else if (change <= config.stopLoss) {
      console.log(`🔴 SL hit for ${user}, exiting...`);
      await vault.exitVault(user, 0, 0);
      await vault.markTrigger(user, "SL");
    } else {
      console.log(`🔄 ${user}: price change ${change.toFixed(2)}% - no action`);
    }
  }
}

monitorVaults().catch(console.error);
