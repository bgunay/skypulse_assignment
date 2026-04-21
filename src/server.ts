import app from "./app";
import { env } from "./config/env";
import { initializeDatabase } from "./db/db";
import { logger } from "./lib/logger";

export async function startServer() {
  await initializeDatabase();

  return app.listen(env.port, () => {
    logger.info("Server running", {
      port: env.port,
      docs: `http://localhost:${env.port}/docs`,
      nodeEnv: env.nodeEnv,
    });
  });
}

if (require.main === module) {
  void startServer();
}
