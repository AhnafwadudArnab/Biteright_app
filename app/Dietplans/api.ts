
const { SERVER_URL } = require("../serverhost");
function getApiBaseUrl() {
  return SERVER_URL;
}

export async function fetchMealPlan(gender: string, bmi: number) {
  // Always send gender as lowercase
  const url = `${getApiBaseUrl()}/users/mealplan?gender=${gender.toLowerCase()}&bmi=${bmi}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch meal plan");
  return res.json();
}
