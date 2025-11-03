import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Your eBay seller ID
const EBAY_SELLER_ID = "timeforgamesllc";

app.get("/listings", async (req, res) => {
  try {
    const query = req.query.q || ""; // optional search term

    // eBay Browse API endpoint filtered by seller
    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(
      query
    )}&filter=sellerIds:{${EBAY_SELLER_ID}}&limit=50`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.EBAY_OAUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("eBay API fetch failed:", text);
      return res.status(500).json({ error: "Failed to fetch eBay listings" });
    }

    const data = await response.json();

    // Map data to front-end format
    const listings = (data.itemSummaries || []).map(item => ({
      title: item.title,
      link: item.itemWebUrl,
      image: item.image?.imageUrl || "https://via.placeholder.com/300x200.png?text=No+Image",
      price: item.price?.value ? `${item.price.value} ${item.price.currency}` : "N/A",
    }));

    res.json({ itemSummaries: listings });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
