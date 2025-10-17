import fetch from "node-fetch";

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

export async function searchJobs(country = "gb", title = "", experience = "") {
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&what=${encodeURIComponent(title)}&experience=${encodeURIComponent(experience)}&content-type=application/json`;

  const response = await fetch(url);
  const data = await response.json();
  return data.results || [];
}
