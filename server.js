import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const EBAY_SELLER_ID = "timeforgamesllc";

app.get("/listings", async (req, res) => {
  try {
    const query = req.query.q || "";

    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=pokemon&filter=sellerIds:{${EBAY_SELLER_ID}}&limit=50`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // Log the HTTP status and body
    const text = await response.text();
    console.log("eBay API status:", response.status);
    console.log("eBay API response:", text);

    // Return the raw response to the browser for inspection
    res.send(text);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
