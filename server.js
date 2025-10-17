import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Get environment variables
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || "us";
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;

// ✅ Home route
app.get("/", (req, res) => {
  res.send("AI Job Finder is running 🚀");
});

// ✅ Main route
app.post("/ask", async (req, res) => {
  const userInput = req.body.question;

  try {
    // 🧠 Step 1: Ask Dobby AI to extract job query info
    const aiResponse = await fetch("https://api.fireworks.ai/inference/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sentientfoundation/dobby-unhinged-llama-3-3-70b-new",
        prompt: `User asked: "${userInput}". 
Extract what kind of job they want, location, and experience. 
Return JSON like: {"job_title": "", "location": "", "experience": ""}`,
        max_tokens: 150,
      }),
    });

    const aiData = await aiResponse.json();
    const text = aiData?.choices?.[0]?.text || "{}";
    const { job_title, location } = JSON.parse(text);

    // 🧭 Step 2: Call Adzuna API
    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=5&what=${encodeURIComponent(job_title)}&where=${encodeURIComponent(location)}`;
    const adzunaRes = await fetch(adzunaUrl);
    const adzunaData = await adzunaRes.json();

    // 🎯 Step 3: Format jobs
    const jobs = adzunaData.results?.map(j => ({
      title: j.title,
      company: j.company.display_name,
      location: j.location.display_name,
      url: j.redirect_url,
    }));

    res.json({ jobs });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ Railway uses PORT automatically
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
