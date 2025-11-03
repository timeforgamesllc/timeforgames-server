import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import xml2js from "xml2js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

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
        return res.status(500).json({ error: "Failed to parse RSS feed" });
      }

      // Attempt to extract items robustly
      const channel = result.rss?.channel;
      let items = [];
      if (channel) {
        if (Array.isArray(channel.item)) {
          items = channel.item;
        } else if (channel.item) {
          items = [channel.item];
        }
      }

      const listings = items.map(item => {
        // Extract image from description
        const imgMatch = item.description?.match(/<img.*?src="(.*?)"/);
        const imageUrl = imgMatch ? imgMatch[1] : "https://via.placeholder.com/300x200.png?text=No+Image";

        // Extract price from description
        const priceMatch = item.description?.match(/\$\d+(?:\.\d{2})?/);
        const priceText = priceMatch ? priceMatch[0] : "N/A";

        return {
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate,
          image: imageUrl,
          price: priceText
        };
      });

      if (listings.length === 0) {
        return res.json({ itemSummaries: [] });
      }

      res.json({ itemSummaries: listings });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
