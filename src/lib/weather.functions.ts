import { createServerFn } from "@tanstack/react-start";
import { fetchLiveWeatherBundleClient } from "./weather";

export const getLiveWeather = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { loadWeatherBundle } = await import("./weather.server");
    const bundle = await loadWeatherBundle();
    if (bundle && bundle.wards && Object.keys(bundle.wards).length > 0) {
      return bundle;
    }
  } catch (err: any) {
    console.error("[getLiveWeather] Server function handler error, falling back:", err?.message || err);
  }
  return fetchLiveWeatherBundleClient();
});
