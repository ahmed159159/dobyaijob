import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// use either FIREWORKS_API_KEY or DOBBY_API_KEY (compatibility)
const FIREWORKS_KEY = process.env.FIREWORKS_API_KEY || process.env.DOBBY_API_KEY;
const FIREWORKS_ENDPOINT = "https://api.fireworks.ai/inference/v1/chat/completions";
const DOBBY_MODEL = "sentientfoundation/dobby-unhinged-llama-3-3-70b-new";

/**
 * call Dobby (Fireworks) with system prompt + user message
 * returns object: { replyText, parsed: { role, location, country, experience }, raw }
 * parsed fields may be empty strings if not provided by user
 */
export async function askDobby(userMessage) {
  const systemPrompt = `
You are Dobby, an intelligent job search assistant.
Your main task is to help users find relevant job opportunities using the Adzuna API.

Behavior:
- Ask clarifying questions if the user request is missing any of: country, job title/specialization, years of experience.
- If the user already provided all required info in one message, respond with JSON ONLY (no extra text) in this exact format:
{
  "role": "frontend developer",
  "location": "Berlin",
  "country": "Germany",
  "experience": "3 years",
  "action": "search"
}
- If some info is missing, reply with a short clarifying question in plain text (e.g., "Which country do you prefer?" or "How many years of experience do you have?").
- After user answers clarifying questions and all fields are collected, respond with a short summary sentence and then the action "search" in JSON (same format).
- Never include API keys or raw API URLs in responses.
- Keep replies concise and user-friendly.
`;

  try {
    const resp = await axios.post(
      FIREWORKS_ENDPOINT,
      {
        model: DOBBY_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 400,
        temperature: 0.0
      },
      { headers: { Authorization: `Bearer ${FIREWORKS_KEY}`, "Content-Type": "application/json" } }
    );

    const content = resp.data?.choices?.[0]?.message?.content?.trim() || "";
    // attempt to parse JSON substring
    let parsed = null;
    try {
      // first try direct parse
      parsed = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }

    const result = {
      replyText: parsed ? null : content, // if parsed JSON, replyText null (we'll act)
      parsed: parsed || { role: "", location: "", country: "", experience: "", action: "" },
      raw: content
    };
    return result;
  } catch (err) {
    console.error("Dobby error:", err?.response?.data || err.message || err);
    return { replyText: "Sorry, Dobby is temporarily unavailable.", parsed: { role: "", location: "", country: "", experience: "", action: "" }, raw: "" };
  }
}
