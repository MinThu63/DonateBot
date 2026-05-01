import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { createOrder, captureOrder } from "./paypal.js";
import { getDonations, saveDonation, getStats } from "./db.js";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Track connected WebSocket clients
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected. Total:", clients.size);

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected. Total:", clients.size);
  });
});

function broadcast(data) {
  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.PAYPAL_ENVIRONMENT });
});

// Create PayPal order (SGD)
app.post("/api/orders", async (req, res) => {
  try {
    const { amount, charity } = req.body;
    if (!amount || !charity) {
      return res.status(400).json({ error: "Amount and charity are required" });
    }
    const order = await createOrder(amount, charity, "SGD");
    res.json(order);
  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Capture PayPal order
app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { charity, donorName } = req.body;
    const capture = await captureOrder(orderID);

    const amount = parseFloat(
      capture.purchase_units[0].payments.captures[0].amount.value
    );

    const donation = saveDonation({
      orderID,
      amount,
      currency: "SGD",
      charity: charity || "General Fund",
      donorName: donorName || "Anonymous",
      status: capture.status,
      timestamp: new Date().toISOString(),
    });

    // Broadcast to robot via WebSocket
    broadcast({
      type: "DONATION_RECEIVED",
      donation,
    });

    res.json({ capture, donation });
  } catch (err) {
    console.error("Capture order error:", err.message);
    res.status(500).json({ error: "Failed to capture order" });
  }
});

app.get("/api/donations", (req, res) => {
  res.json(getDonations());
});

app.get("/api/stats", (req, res) => {
  res.json(getStats());
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket running on ws://localhost:${PORT}`);
  console.log(`Environment: ${process.env.PAYPAL_ENVIRONMENT}`);
});
