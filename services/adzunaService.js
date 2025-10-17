import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function searchJobs({ role, location }) {
  const url = `https://api.adzuna.com/v1/api/jobs/${process.env.ADZUNA_COUNTRY}/search/1`;

  const params = {
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    results_per_page: 10,
    what: role,
    where: location,
    sort_by: "relevance"
  };

  try {
    const res = await axios.get(url, { params });
    return res.data.results.map(job => ({
      title: job.title,
      company: job.company?.display_name || "",
      location: job.location?.display_name || "",
      salary: job.salary_min || "",
      description: job.description?.slice(0, 250) + "...",
      url: job.redirect_url
    }));
  } catch (err) {
    console.error("❌ Error from Adzuna:", err.message);
    return [];
  }
}
