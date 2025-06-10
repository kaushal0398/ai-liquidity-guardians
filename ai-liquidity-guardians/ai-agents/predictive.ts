import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Simulated trend agent 
async function predictTrend(): Promise<"up" | "down" | "neutral"> {
  const random = Math.random();
  if (random > 0.66) return "up";
  if (random < 0.33) return "down";
  return "neutral";
}

// Simulated interaction with keeper bot endpoint
async function triggerKeeper(action: string) {
  const keeperUrl = "http://localhost:3001/trigger"; // Assume local keeper server
  const res = await fetch(keeperUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trigger: action }),
  });

  const data = await res.json();
  console.log("📬 Trigger sent:", data);
}

async function runAgent() {
  const trend = await predictTrend();
  console.log("🤖 Predicted trend:", trend);

  if (trend === "up") {
    await triggerKeeper("predictive-take-profit");
  } else if (trend === "down") {
    await triggerKeeper("predictive-stop-loss");
  } else {
    console.log("🔄 No trigger: market neutral");
  }
}

runAgent().catch(console.error);
