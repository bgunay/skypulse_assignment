import request from "supertest";
import app from "../app";
import * as activityService from "../services/activity.service";
import * as dbModule from "../db/db";

describe("app", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("wires /api/v1/activity-score route", async () => {
    jest.spyOn(activityService, "getActivityScore").mockResolvedValue({
      score: 75,
      recommendation: "Good conditions for outdoor activities",
      weather: {
        temperature: 21,
        wind_speed: 9,
        conditions: 2,
      },
      air_quality: {
        pm2_5: 11,
        pm10: 22,
      },
    });

    const res = await request(app).get("/api/v1/activity-score?lat=40.71&lon=-74.01");

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(75);
  });

  test("wires /api/v1/locations route", async () => {
    jest.spyOn(dbModule, "getLocations").mockResolvedValue(["40.71,-74.01"]);

    const res = await request(app).get("/api/v1/locations");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ locations: ["40.71,-74.01"] });
  });
});