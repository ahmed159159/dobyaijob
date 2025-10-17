import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function analyzeQuery(userQuery) {
  const prompt = `
  You are an AI that extracts job search details from user requests.
  Return JSON with fields: role, location, experience, category, remote, salary_min.
  
  Example:
  Input: "عايز شغل frontend في دبي بخبرة سنتين"
  Output: {"role":"frontend developer","location":"Dubai","experience":"2 years","category":"IT","remote":"no","salary_min":""}
  
  Input: "${userQuery}"
  Output:
  `;

  try {
    const response = await axios.post(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        model: "sentientfoundation/dobby-unhinged-llama-3-3-70b-new",
        messages: [
          { role: "system", content: "You are a structured data extraction assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300
      },
      {
        headers: { Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}` }
      }
    );

    const content = response.data.choices?.[0]?.message?.content?.trim();
    return JSON.parse(content);
  } catch (err) {
    console.error("❌ Error from Dobby:", err.message);
    return null;
  }
}
