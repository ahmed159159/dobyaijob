import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { searchJobs } from "./services/adzunaService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("✅ AI Job Finder is running!");
});

// Route to search jobs directly
app.get("/search", async (req, res) => {
  const { query, location, country } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Missing job query." });
  }

  try {
    const results = await searchJobs(query, location, country);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to interact with Dobby AI
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question." });

  try {
    const aiResponse = await axios.post(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        model: "sentientfoundation/dobby-unhinged-llama-3-3-70b-new",
        messages: [
          { role: "system", content: "You are a job assistant AI that helps users find jobs via Adzuna API." },
          { role: "user", content: question },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DOBBY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: aiResponse.data });
  } catch (error) {
    console.error("❌ Error with Dobby API:", error.message);
    res.status(500).json({ error: "Dobby AI request failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
