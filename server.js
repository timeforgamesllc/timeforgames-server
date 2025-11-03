import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import xml2js from "xml2js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// eBay RSS feed URL for your store
const EBAY_RSS_URL = "https://www.ebay.com/sch/timeforgamesllc/m.html?_rss=1";

app.get("/listings", async (req, res) => {
  try {
    const response = await fetch(EBAY_RSS_URL);
    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch RSS feed" });
    }

    const xmlData = await response.text();
    const parser = new xml2js.Parser({ explicitArray: false });

    parser.parseString(xmlData, (err, result) => {
      if (err) {
        console.error("XML parse error:", err);
        return res.status(500).json({ error: "Failed to parse RSS feed" });
      }

      let items = [];
      const channel = result.rss?.channel;
      if (channel) {
        if (Array.isArray(channel.item)) {
          items = channel.item;
        } else if (channel.item) {
          items = [channel.item];
        }
      }

      const listings = items.map(item => {
        const imgMatch = item.description?.match(/<img.*?src="(.*?)"/);
        const imageUrl = imgMatch ? imgMatch[1] : "https://via.placeholder.com/300x200.png?text=No+Image";

        const priceMatch = item.description?.match(/\$\d+(?:\.\d{2})?/);
        const priceText = priceMatch ? priceMatch[0] : "N/A";

        return {
          title: item.title,
          link: item.link,
          image: imageUrl,
          price: priceText
        };
      });

      res.json({ itemSummaries: listings });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
