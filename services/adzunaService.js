import axios from "axios";

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
    return response.data.results.map((job) => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description,
      url: job.redirect_url,
      salary: job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : "N/A",
    }));
  } catch (error) {
    console.error("Error fetching jobs from Adzuna:", error.message);
    throw new Error("Failed to fetch job listings.");
  }
}
