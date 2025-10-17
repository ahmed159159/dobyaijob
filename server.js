import express from "express";
import fetch from "node-fetch"; // لو كنت تستخدم node-fetch
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { searchJobs } from "./services/adzunaService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files (Frontend)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.post("/search", async (req, res) => {
  try {
    const { country, title, experience } = req.body;
    const jobs = await searchJobs(country, title, experience);
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Use Railway PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
