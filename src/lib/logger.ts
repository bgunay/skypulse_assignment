import fs from "fs";
import path from "path";
import { env } from "../config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

let logStream: fs.WriteStream | undefined;

function getLogStream() {
  if (!env.logToFile) {
    return undefined;
  }

  if (!logStream) {
    const fullPath = path.resolve(process.cwd(), env.logFilePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    logStream = fs.createWriteStream(fullPath, { flags: "a" });
  }

  return logStream;
}

function write(level: LogLevel, message: string, fields: LogFields = {}) {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };

  const line = JSON.stringify(payload);
  const stream = getLogStream();

  if (stream) {
    stream.write(`${line}\n`);
  }

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

export const logger = {
  debug(message: string, fields?: LogFields) {
    write("debug", message, fields);
  },
  info(message: string, fields?: LogFields) {
    write("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    write("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    write("error", message, fields);
  },
};
