/**
 * fetch() with a timeout.
 * Throws an error with a user-friendly message if the request takes too long
 * or if the device can't reach the server at all.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Request timed out. Make sure the backend server is running and you're on the same network.");
    }
    // Network unreachable
    throw new Error("Network error. Make sure the backend server is running and your device is on the same WiFi.");
  } finally {
    clearTimeout(timer);
  }
}
