import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeQuery } from "./services/dobbyService.js";
import { searchJobs } from "./services/adzunaService.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🤖 AI Job Finder API is running successfully!");
});

app.post("/api/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing 'query' in body" });

    console.log("🧠 Analyzing:", query);
    const analysis = await analyzeQuery(query);

    if (!analysis?.role && !analysis?.location)
      return res.json({ message: "Could not understand query", analysis });

    console.log("🔍 Searching:", analysis);
    const jobs = await searchJobs({
      role: analysis.role,
      location: analysis.location
    });

    res.json({ analysis, jobs });
  } catch (err) {
    console.error("🔥 Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
});
