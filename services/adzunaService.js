import axios from "axios";

/**
 * Search jobs from Adzuna API
 * @param {string} query - job title or keywords (e.g., "software engineer")
 * @param {string} location - location or city (e.g., "Berlin")
 * @param {string} country - country code (e.g., "de", "gb", "us")
 * @returns {Promise<Array>} list of job results
 */
export async function searchJobs(query, location, country = process.env.ADZUNA_COUNTRY) {
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;

  const params = {
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    what: query,
    where: location,
    results_per_page: 10,
    content_type: "application/json",
  };

  try {
    const response = await axios.get(url, { params });
    const jobs = response.data.results || [];

    // Format job results
    return jobs.map((job) => ({
      title: job.title || "Untitled",
      company: job.company?.display_name || "Unknown Company",
      location: job.location?.display_name || "Unknown Location",
      description: job.description?.slice(0, 150) + "...",
      url: job.redirect_url,
      salary:
        job.salary_min && job.salary_max
          ? `${job.salary_min} - ${job.salary_max}`
          : "Not specified",
    }));
  } catch (error) {
    console.error("❌ Error fetching jobs from Adzuna:", error.message);
    throw new Error("Failed to fetch job listings from Adzuna API.");
  }
}
