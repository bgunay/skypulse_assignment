import express from "express";
import request from "supertest";
import locationRouter from "../../controllers/location.controller";
import { errorHandler } from "../../middleware/error-handler";
import * as dbModule from "../../db/db";

describe("location.controller", () => {
  const app = express();
  app.use("/api/v1", locationRouter);
  app.use(errorHandler);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns locations", async () => {
    jest
      .spyOn(dbModule, "getLocations")
      .mockResolvedValue(["40.71,-74.01", "41.88,-87.63"]);

    const res = await request(app).get("/api/v1/locations");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      locations: ["40.71,-74.01", "41.88,-87.63"],
    });
  });
});
