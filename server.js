import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/listings", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.ebay.com/buy/browse/v1/item_summary/search?q=pokemon%20cards&limit=10",
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
