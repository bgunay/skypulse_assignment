import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error";
import { logger } from "../lib/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message =
    err instanceof HttpError && err.expose ? err.message : "Internal server error";

  logger.error("Request failed", {
    requestId: res.locals.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: err instanceof Error ? err.message : String(err),
  });

  res.status(statusCode).json({ error: message });
}
