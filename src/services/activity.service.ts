import axios from "axios";
import { env } from "../config/env";
import { getPreferences } from "../db/db";
import { HttpError } from "../lib/http-error";
import { logger } from "../lib/logger";
import { calculateScore, getRecommendation } from "../utils/score";

type WeatherResponse = {
  current_weather?: {
    temperature?: number;
    windspeed?: number;
    weathercode?: number;
  };
};

type AirQualityResponse = {
  current?: {
    pm2_5?: number;
    pm10?: number;
  };
};

export type ActivityScoreResponse = {
  score: number;
  recommendation: string;
  weather: {
    temperature: number | undefined;
    wind_speed: number | undefined;
    conditions: number | undefined;
  };
  air_quality: {
    pm2_5: number | undefined;
    pm10: number | undefined;
  };
};

export async function getActivityScore(
  lat: number,
  lon: number,
  userId?: string
): Promise<ActivityScoreResponse> {
  let weather: WeatherResponse;
  let air: AirQualityResponse;

  try {
    const [weatherRes, airRes] = await Promise.all([
      axios.get<WeatherResponse>(env.weatherBaseUrl, {
        params: { latitude: lat, longitude: lon, current_weather: true },
        timeout: env.httpTimeoutMs,
      }),
      axios.get<AirQualityResponse>(env.airQualityBaseUrl, {
        params: { latitude: lat, longitude: lon, current: "pm10,pm2_5" },
        timeout: env.httpTimeoutMs,
      }),
    ]);

    weather = weatherRes.data;
    air = airRes.data;
  } catch (error) {
    logger.error("Upstream weather lookup failed", {
      lat,
      lon,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new HttpError(502, "Failed to retrieve weather data");
  }

  const score = calculateScore(weather, air);
  const locationId = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const preferences = await getPreferences(locationId);

  logger.debug("Fetched location preferences", {
    locationId,
    count: preferences.length,
  });

  sendAnalytics(userId, lat, lon, score);

  return {
    score,
    recommendation: getRecommendation(score),
    weather: {
      temperature: weather.current_weather?.temperature,
      wind_speed: weather.current_weather?.windspeed,
      conditions: weather.current_weather?.weathercode,
    },
    air_quality: {
      pm2_5: air.current?.pm2_5,
      pm10: air.current?.pm10,
    },
  };
}

function sendAnalytics(
  userId: string | undefined,
  lat: number,
  lon: number,
  score: number
) {
  if (!userId) return;

  setImmediate(() => {
    void axios
      .post(
        env.analyticsEndpoint,
        {
          event: "activity_score_calculated",
          user_id: userId,
          latitude: lat,
          longitude: lon,
          score,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${env.analyticsApiKey}`,
          },
          timeout: env.analyticsTimeoutMs,
        }
      )
      .catch((error: unknown) => {
        logger.warn("Analytics publish failed", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
      });
  });
}
