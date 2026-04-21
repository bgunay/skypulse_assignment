import axios from "axios";
import request from "supertest";
import app from "../../app";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({ data: {} });
  });

  test("GET /health returns service status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  test("GET /docs/openapi.json exposes endpoint documentation", async () => {
    const res = await request(app).get("/docs/openapi.json");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.paths["/api/v1/activity-score"]).toBeDefined();
    expect(res.body.paths["/api/v1/locations"]).toBeDefined();
  });

  test("GET /api/v1/activity-score returns the full API response shape", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          current_weather: {
            temperature: 22,
            windspeed: 8,
            weathercode: 1,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          current: {
            pm2_5: 12,
            pm10: 20,
          },
        },
      });

    const res = await request(app).get(
      "/api/v1/activity-score?lat=-33.51&lon=151.02&user_id=user-123"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      score: 100,
      recommendation: "Good conditions for outdoor activities",
      weather: {
        temperature: 22,
        wind_speed: 8,
        conditions: 1,
      },
      air_quality: {
        pm2_5: 12,
        pm10: 20,
      },
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  test("GET /api/v1/locations returns seeded SQLite locations", async () => {
    const res = await request(app).get("/api/v1/locations");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.locations)).toBe(true);
    expect(res.body.locations.length).toBeGreaterThan(0);
    expect(res.body.locations).toContain("-33.51,151.02");
  });
});
