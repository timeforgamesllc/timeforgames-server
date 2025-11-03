import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow browser requests

app.get("/listings", async (req, res) => {
  const query = req.query.q || ""; // optional search term
  const username = "timeforgamesllc"; // <-- Replace with your eBay seller ID

  try {
    // Fetch listings from eBay API, filtered by your seller ID
    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&filter=sellerIds:{${username}}&limit=50`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (data.errors) {
      console.error("eBay API error:", data);
      return res.status(500).json({ error: "eBay API error" });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
