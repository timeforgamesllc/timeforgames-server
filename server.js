import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import cheerio from "cheerio"; // for HTML parsing

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const STORE_URL = "https://www.ebay.com/str/timeforgamesllc";

app.get("/listings", async (req, res) => {
  try {
    const response = await fetch(STORE_URL);
    const html = await response.text();

    const $ = cheerio.load(html);

    const listings = [];

    $(".s-item").each((i, el) => {
      const title = $(el).find(".s-item__title").text().trim();
      const link = $(el).find(".s-item__link").attr("href");
      const image = $(el).find(".s-item__image-img").attr("src") || "https://via.placeholder.com/300x200.png?text=No+Image";
      const price = $(el).find(".s-item__price").first().text().trim();

      if (title && link) {
        listings.push({ title, link, image, price });
      }
    });

    res.json({ itemSummaries: listings.slice(0, 50) }); // limit to first 50 listings
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
