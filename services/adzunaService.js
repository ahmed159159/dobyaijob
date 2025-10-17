import fetch from "node-fetch";

export async function searchJobs(query, location = "us") {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const apiKey = process.env.ADZUNA_APP_KEY;
    const country = location.toLowerCase() || process.env.ADZUNA_COUNTRY || "us";

    const apiUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=5&what=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();

    // لو مفيش نتائج
    if (!data.results || data.results.length === 0) {
      return [
        {
          title: "No jobs found",
          company: "N/A",
          location: "N/A",
          redirect_url: "",
        },
      ];
    }

    // نرجع النتائج بشكل منسق
    return data.results.map((job) => ({
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      url: job.redirect_url,
    }));
  } catch (error) {
    console.error("Error fetching jobs from Adzuna:", error);
    return [
      {
        title: "Error fetching jobs",
        company: "N/A",
        location: "N/A",
        redirect_url: "",
      },
    ];
  }
}
