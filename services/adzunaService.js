import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs";

/**
 * Search Adzuna
 * - countryCode e.g. 'gb' or 'de'
 * - what: job title/keywords
 * - where: location/city (optional)
 */
export async function searchAdzuna(what = "", where = "", countryCode = process.env.ADZUNA_COUNTRY || "gb", results_per_page = 6) {
  try {
    const url = `${ADZUNA_BASE}/${countryCode}/search/1`;
    const params = {
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_APP_KEY,
      what,
      where,
      results_per_page,
      sort_by: "relevance"
    };

    const resp = await axios.get(url, { params, headers: { Accept: "application/json" } });
    const jobs = resp.data?.results || [];
    return jobs.map(j => ({
      id: j.id || "",
      title: j.title || "",
      company: j.company?.display_name || "",
      location: j.location?.display_name || "",
      description: j.description ? (j.description.slice(0, 250) + (j.description.length > 250 ? "..." : "")) : "",
      redirect_url: j.redirect_url || "",
      salary_min: j.salary_min || null,
      salary_max: j.salary_max || null,
      created: j.created || ""
    }));
  } catch (err) {
    console.error("Adzuna error:", err?.response?.data || err.message || err);
    return [];
  }
}
