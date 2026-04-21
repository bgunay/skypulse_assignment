import express from "express";
import activityRouter from "./controllers/activity.controller";
import locationRouter from "./controllers/location.controller";
import { docsRouter } from "./docs/router";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { requestLogger, requestScope } from "./middleware/request-logger";

const app = express();

app.use(express.json());
app.use(requestScope);
app.use(requestLogger);
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/", docsRouter);
app.use("/api/v1", activityRouter);
app.use("/api/v1", locationRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
