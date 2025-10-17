import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function searchAdzunaJobs({ what = "", where = "", countryCode = "gb", page = 1, results_per_page = 10 }) {
  const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}`;

  const params = {
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    results_per_page,
    what,
    where,
    sort_by: "relevance"
  };

  try {
    const res = await axios.get(url, { params, headers: { Accept: "application/json" } });
    const results = res.data?.results || [];

    return results.map((job) => ({
      id: job.id || "",
      title: job.title || "",
      company: job.company?.display_name || "",
      location: job.location?.display_name || "",
      salary_min: job.salary_min || null,
      salary_max: job.salary_max || null,
      description: job.description ? job.description.slice(0, 300) + (job.description.length > 300 ? "..." : "") : "",
      redirect_url: job.redirect_url || job.redirect_url_alt || "",
      created: job.created || ""
    }));
  } catch (err) {
    console.error("Adzuna API error:", err.message || err.toString());
    return [];
  }
}
