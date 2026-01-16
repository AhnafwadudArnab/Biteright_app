
let cachedIp: string | null = null;

// Home and University IP/Port

const { SERVER_URL } = require("../serverhost");
async function getApiBaseUrl() {
  return SERVER_URL;
}

export async function fetchMealPlan(gender: string, bmi: number) {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}/users/mealplan?gender=${encodeURIComponent(gender.toLowerCase())}&bmi=${encodeURIComponent(bmi)}`;
  const res = await fetch(url);
  if (!res.ok) {
    let msg = `API error: ${res.status}`;
    try {
      const err = await res.json();
      if (err && err.message) msg += ` - ${err.message}`;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
// Use SERVER_IP from serverhost.tsx
