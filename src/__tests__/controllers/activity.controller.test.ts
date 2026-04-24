import express from "express";
import request from "supertest";
import activityRouter from "../../controllers/activity.controller";
import { errorHandler } from "../../middleware/error-handler";
import * as activityService from "../../services/activity.service";

describe("activity.controller", () => {
  const app = express();
  app.use("/api/v1", activityRouter);
  app.use(errorHandler);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 400 when lat/lon are missing", async () => {
    const res = await request(app).get("/api/v1/activity-score");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "lat and lon are required" });
  });

  test("returns 400 when lat/lon are invalid", async () => {
    const res = await request(app).get("/api/v1/activity-score?lat=abc&lon=xyz");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "lat and lon must be numbers" });
  });

  test("returns 400 when lat is out of range", async () => {
    const res = await request(app).get("/api/v1/activity-score?lat=91&lon=45");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "lat must be between -90 and 90" });
  });

  test("returns 400 when lon is out of range", async () => {
    const res = await request(app).get("/api/v1/activity-score?lat=45&lon=-181");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "lon must be between -180 and 180" });
  });

  test("returns service result for valid request", async () => {
    jest.spyOn(activityService, "getActivityScore").mockResolvedValue({
      score: 88,
      recommendation: "Good conditions for outdoor activities",
      weather: {
        temperature: 20,
        wind_speed: 6,
        conditions: 1,
      },
      air_quality: {
        pm2_5: 10,
        pm10: 18,
      },
    });

    const res = await request(app).get(
      "/api/v1/activity-score?lat=40.71&lon=-74.01&user_id=u1"
    );

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(88);
    expect(activityService.getActivityScore).toHaveBeenCalledWith(
      40.71,
      -74.01,
      "u1"
    );
  });

  test("returns 500 if service throws", async () => {
    jest
      .spyOn(activityService, "getActivityScore")
      .mockRejectedValue(new Error("service failed"));

    const res = await request(app).get(
      "/api/v1/activity-score?lat=40.71&lon=-74.01"
    );

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error" });
  });
});
