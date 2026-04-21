export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "SkyPulse API",
    version: "1.0.0",
    description:
      "Node.js rewrite of the SkyPulse backend that returns outdoor activity scores based on weather and air quality.",
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "System" },
    { name: "Activity" },
    { name: "Locations" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service health",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/activity-score": {
      get: {
        tags: ["Activity"],
        summary: "Get an outdoor activity score",
        parameters: [
          {
            in: "query",
            name: "lat",
            required: true,
            schema: { type: "number", format: "float", example: 40.71 },
          },
          {
            in: "query",
            name: "lon",
            required: true,
            schema: { type: "number", format: "float", example: -74.01 },
          },
          {
            in: "query",
            name: "user_id",
            required: false,
            schema: { type: "string", example: "user-123" },
          },
        ],
        responses: {
          "200": {
            description: "Activity score response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    score: { type: "number", example: 82 },
                    recommendation: {
                      type: "string",
                      example: "Good conditions for outdoor activities",
                    },
                    weather: {
                      type: "object",
                      properties: {
                        temperature: { type: "number", nullable: true, example: 21.3 },
                        wind_speed: { type: "number", nullable: true, example: 8.4 },
                        conditions: { type: "number", nullable: true, example: 1 },
                      },
                    },
                    air_quality: {
                      type: "object",
                      properties: {
                        pm2_5: { type: "number", nullable: true, example: 12.1 },
                        pm10: { type: "number", nullable: true, example: 20.7 },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid query parameters",
          },
          "502": {
            description: "Upstream provider failure",
          },
        },
      },
    },
    "/api/v1/locations": {
      get: {
        tags: ["Locations"],
        summary: "List tracked locations",
        responses: {
          "200": {
            description: "Known locations",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    locations: {
                      type: "array",
                      items: { type: "string", example: "40.71,-74.01" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
