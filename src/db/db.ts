import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const dbPromise = open({
  filename: path.resolve(process.cwd(), env.dbPath),
  driver: sqlite3.Database,
});

const initializedDbPromise = dbPromise.then(async (db) => {
  await db.exec(
    "CREATE INDEX IF NOT EXISTS idx_user_preferences_location_id ON user_preferences(location_id)"
  );
  logger.info("Database initialized", { dbPath: env.dbPath });
  return db;
});

export async function getPreferences(locationId: string) {
  const db = await initializedDbPromise;
  return db.all(
    "SELECT preference_type, preference_value FROM user_preferences WHERE location_id = ?",
    [locationId]
  );
}

export async function getLocations() {
  const db = await initializedDbPromise;
  const rows = await db.all(
    "SELECT DISTINCT location_id FROM user_preferences LIMIT 100"
  );
  return rows.map((r: any) => r.location_id);
}

export async function initializeDatabase() {
  await initializedDbPromise;
}
