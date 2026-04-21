import axios from "axios";
import { getActivityScore } from "../../services/activity.service";
import * as dbModule from "../../db/db";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const flushImmediate = () => new Promise((resolve) => setImmediate(resolve));

describe("getActivityScore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns correctly shaped activity score response", async () => {
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

    jest.spyOn(dbModule, "getPreferences").mockResolvedValue([]);
    const postSpy = mockedAxios.post.mockResolvedValue({ data: {} });

    const result = await getActivityScore(40.71, -74.01, "user-123");

    expect(result).toEqual({
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

    expect(dbModule.getPreferences).toHaveBeenCalledWith("40.71,-74.01");
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);

    await flushImmediate();
    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  test("works without user_id and skips analytics", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          current_weather: {
            temperature: 35,
            windspeed: 25,
            weathercode: 3,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          current: {
            pm2_5: 40,
            pm10: 80,
          },
        },
      });

    jest.spyOn(dbModule, "getPreferences").mockResolvedValue([]);
    const postSpy = mockedAxios.post.mockResolvedValue({ data: {} });

    const result = await getActivityScore(41.88, -87.63);

    expect(result.score).toBe(35);
    expect(result.recommendation).toBe("Consider indoor activities today");

    await flushImmediate();
    expect(postSpy).not.toHaveBeenCalled();
  });
});