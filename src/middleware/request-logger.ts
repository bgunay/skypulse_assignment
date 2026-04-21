import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export function requestScope(_req: Request, res: Response, next: NextFunction) {
  res.locals.requestId = crypto.randomUUID();
  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info("Request completed", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}
