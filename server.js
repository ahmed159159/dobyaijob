import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/search", async (req, res) => {
  const { query, location } = req.body;

  try {
    const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/${process.env.ADZUNA_COUNTRY}/search/1`, {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        what: query,
        where: location,
        results_per_page: 5
      }
    });

    const jobs = response.data.results.map(job => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      url: job.redirect_url
    }));

    res.json({ results: jobs });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error.message);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
