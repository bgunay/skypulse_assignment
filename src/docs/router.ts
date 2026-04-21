import { Router } from "express";
import { openApiDocument } from "./openapi";

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SkyPulse API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.json',
        dom_id: '#swagger-ui'
      });
    </script>
  </body>
</html>`;

export const docsRouter = Router();

docsRouter.get("/", (_req, res) => {
  res.json({
    name: "SkyPulse API",
    docs: "/docs",
    openapi: "/docs/openapi.json",
    health: "/health",
  });
});

docsRouter.get("/docs", (_req, res) => {
  res.type("html").send(swaggerHtml);
});

docsRouter.get("/docs/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});
