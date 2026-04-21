type NodeEnv = "development" | "test" | "production";

function getNodeEnv(value: string | undefined): NodeEnv {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
}

function getNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

export const env = {
  nodeEnv: getNodeEnv(process.env.NODE_ENV),
  port: getNumber(process.env.PORT, 3000),
  dbPath: process.env.DB_PATH || "skypulse.db",
  analyticsEndpoint: process.env.ANALYTICS_ENDPOINT || "https://httpbin.org/post",
  analyticsApiKey: process.env.ANALYTICS_API_KEY || "dummy",
  weatherBaseUrl: process.env.WEATHER_API_URL || "https://api.open-meteo.com/v1/forecast",
  airQualityBaseUrl:
    process.env.AIR_QUALITY_API_URL ||
    "https://air-quality-api.open-meteo.com/v1/air-quality",
  httpTimeoutMs: getNumber(process.env.HTTP_TIMEOUT_MS, 3000),
  analyticsTimeoutMs: getNumber(process.env.ANALYTICS_TIMEOUT_MS, 2000),
  logToFile: getBoolean(process.env.LOG_TO_FILE, false),
  logFilePath: process.env.LOG_FILE_PATH || "logs/app.log",
};
