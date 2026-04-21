import { calculateScore, getRecommendation } from "../../utils/score";

describe("calculateScore", () => {
  test("returns 100 for ideal weather and air quality", () => {
    const score = calculateScore(
      { current_weather: { temperature: 20, windspeed: 5 } },
      { current: { pm2_5: 10, pm10: 20 } }
    );

    expect(score).toBe(100);
  });

  test("reduces score for bad weather and bad air quality", () => {
    const score = calculateScore(
      { current_weather: { temperature: 35, windspeed: 35 } },
      { current: { pm2_5: 60, pm10: 120 } }
    );

    expect(score).toBe(0);
  });

  test("never goes below 0", () => {
    const score = calculateScore(
      { current_weather: { temperature: 100, windspeed: 100 } },
      { current: { pm2_5: 500, pm10: 500 } }
    );

    expect(score).toBe(0);
  });
});

describe("getRecommendation", () => {
  test("returns indoor recommendation for low score", () => {
    expect(getRecommendation(40)).toBe("Consider indoor activities today");
  });

  test("returns moderate recommendation for medium score", () => {
    expect(getRecommendation(60)).toBe(
      "Moderate conditions - light outdoor activities recommended"
    );
  });

  test("returns good recommendation for high score", () => {
    expect(getRecommendation(90)).toBe("Good conditions for outdoor activities");
  });
});