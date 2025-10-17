import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * Calls Fireworks / Dobby model to extract search parameters from a natural query.
 * Returns a normalized object:
 * { role, location, country, experience, employment_type, remote, salary_min, raw }
 */
export async function analyzeQueryWithDobby(userQuery) {
  const system = "You are a structured data extraction assistant. Extract job-search parameters from the user's query and return VALID JSON only.";
  const userPrompt = `
User query: "${userQuery}"

Return a JSON object with the following fields (use empty string if unknown):
{
  "role": "",            // e.g. "frontend developer", "marketing"
  "location": "",        // e.g. "Berlin", "Germany", "remote"
  "country": "",         // country name if mentioned, e.g. "Germany"
  "experience": "",      // e.g. "2 years", "senior", "entry-level"
  "employment_type": "", // "full-time", "part-time", "contract", "internship"
  "remote": "",          // "yes" or "no" or ""
  "salary_min": ""       // numeric or empty
}
Only output the JSON object and nothing else.
`;

  try {
    const resp = await axios.post(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        model: "sentientfoundation/dobby-unhinged-llama-3-3-70b-new",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = resp.data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return { raw: "", role: "", location: "", country: "", experience: "", employment_type: "", remote: "", salary_min: "" };
    }

    // Try parse JSON safely
    try {
      const parsed = JSON.parse(content);
      return { ...parsed, raw: content };
    } catch (e) {
      // fallback: attempt to extract a JSON-looking substring
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return { ...parsed, raw: content };
        } catch (err) {
          // give raw text if parsing fails
          return { raw: content, role: "", location: "", country: "", experience: "", employment_type: "", remote: "", salary_min: "" };
        }
      }
      return { raw: content, role: "", location: "", country: "", experience: "", employment_type: "", remote: "", salary_min: "" };
    }
  } catch (err) {
    console.error("Dobby API error:", err.message || err.toString());
    return { raw: "", role: "", location: "", country: "", experience: "", employment_type: "", remote: "", salary_min: "" };
  }
}
