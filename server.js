import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Base route
app.get("/", (req, res) => {
  res.send("✅ AI Job Finder is running successfully!");
});

// 🔹 Adzuna Job Search Endpoint
app.post("/search", async (req, res) => {
  try {
    const { query, location, country = "gb" } = req.body;

    const app_id = process.env.ADZUNA_APP_ID;
    const app_key = process.env.ADZUNA_APP_KEY;

    if (!app_id || !app_key) {
      return res.status(400).json({ error: "Missing Adzuna API credentials" });
    }

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${app_id}&app_key=${app_key}&what=${encodeURIComponent(
      query
    )}&where=${encodeURIComponent(location)}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({
      success: true,
      results: data.results?.map((job) => ({
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        url: job.redirect_url,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// 🔹 Railway compatible port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
