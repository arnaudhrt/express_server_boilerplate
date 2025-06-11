import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { logger } from "./shared/utils/logger";
import { healthCheckMiddleware, healthCheckDetailedMiddleware } from "./shared/middleware/healthCheck.middleware";
import { validateEnv } from "@/utils/validateEnv";
import { HttpStatusCode } from "./shared/types/errors";
import { errorHandlerMiddleware } from "./shared/middleware/errorHandler.middleware";

// Load environment variables
validateEnv();
dotenv.config();

// Initialize Express app
const app: Application = express();

// Security middlewares (to configure for production)
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", healthCheckMiddleware);
app.get("/health/detailed", healthCheckDetailedMiddleware);

// Public routes

// Protected routes

// Error handling middleware
app.use(errorHandlerMiddleware);

// 404 handler
app.use((req, res) => {
  logger.error(`${req.method} ${req.path} - Route not found`);
  res.status(HttpStatusCode.NOT_FOUND).json({ message: "Route not found" });
});

export default app;
