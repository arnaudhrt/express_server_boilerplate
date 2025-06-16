import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { logger } from "./shared/utils/logger";
import { ErrorHandler } from "./shared/utils/errorHandler";
import { db } from "./shared/database/database";

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await db.testConnection();
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    // Graceful shutdown handler
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(async () => {
        logger.info("HTTP server closed");
        await db.close();
        process.exit(0);
      });
    };
    // Handle signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    const apiError = ErrorHandler.processError(error);
    logger.error(apiError.message, apiError);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();
