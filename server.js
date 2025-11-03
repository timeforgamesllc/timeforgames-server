import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import xml2js from "xml2js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow browser requests

// eBay RSS feed URL for your store
const EBAY_RSS_URL = "https://www.ebay.com/sch/timeforgamesllc/m.html?_rss=1";

app.get("/listings", async (req, res) => {
  try {
    // Fetch the RSS feed
    const response = await fetch(EBAY_RSS_URL);
    const xmlData = await response.text();

    // Parse XML into JS object
    const parser = new xml2js.Parser();
    parser.parseString(xmlData, (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return res.status(500).json({ error: "Failed to parse RSS feed" });
      }

      // Extract items
      const items = result.rss.channel[0].item || [];

      // Map to a simpler JSON structure
      const listings = items.map(item => ({
        title: item.title[0],
        link: item.link[0],
        description: item.description[0],
        pubDate: item.pubDate[0],
      }));

      res.json({ itemSummaries: listings });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
