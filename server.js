import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { askDobby } from "./services/dobbyService.js";
import { searchAdzuna } from "./services/adzunaService.js";
import { countryMap } from "./utils/countryMap.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DEFAULT_COUNTRY_CODE = process.env.ADZUNA_COUNTRY || "gb";

function detectCountryCode(nameOrLocation) {
  if (!nameOrLocation) return DEFAULT_COUNTRY_CODE;
  const s = nameOrLocation.toLowerCase();
  if (countryMap[s]) return countryMap[s];
  // try tokens
  for (const token of Object.keys(countryMap)) {
    if (s.includes(token)) return countryMap[token];
  }
  return DEFAULT_COUNTRY_CODE;
}

// health
app.get("/", (req, res) => res.send("✅ AI Job Finder (Dobby) is running"));

// chat endpoint: receives user message, returns either Dobby clarifying question or search results
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Missing 'message' in body" });

    // ask dobby
    const dobbyResp = await askDobby(message);

    // if dobby returned plain text (clarifying question), send it back
    if (dobbyResp.replyText && dobbyResp.replyText.trim().length > 0) {
      return res.json({ type: "clarify", text: dobbyResp.replyText });
    }

    // otherwise dobby returned parsed JSON with fields
    const parsed = dobbyResp.parsed || {};
    // role/what
    const what = (parsed.role || parsed.what || "").trim() || message;
    // location or country
    const loc = (parsed.location || "").trim();
    const countryName = (parsed.country || parsed.country_name || parsed.location || "").trim();
    const countryCode = detectCountryCode(countryName || loc) || DEFAULT_COUNTRY_CODE;
    const experience = (parsed.experience || "").trim();

    // call Adzuna
    const jobs = await searchAdzuna(what, loc, countryCode, 6);

    // format assistant reply
    const summary = `Here are some ${what} jobs in ${countryName || loc || countryCode}${experience ? ` for ${experience}` : ""}:`;
    return res.json({ type: "results", summary, jobs });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
