import { Request, Response } from "express";
import { db } from "@/config/database";
import { ApiResponse, HealthStatus } from "@/types/response";
import { config } from "@/config/config";

export const healthCheckMiddleware = (req: Request, res: Response) => {
  const response: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    message: "Service is healthy",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  };
  res.status(200).json(response);
};

export const healthCheckDetailedMiddleware = async (req: Request, res: Response) => {
  const startTime = Date.now();

  // Test database connection
  let dbStatus = "disconnected";
  let dbResponseTime: number | undefined;

  try {
    const dbStart = Date.now();
    await db.query("SELECT 1");
    dbResponseTime = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "disconnected";
  }

  // Get memory usage
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

  // Get uptime
  const uptime = process.uptime();

  const healthData: HealthStatus = {
    status: dbStatus === "connected" ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: Math.round(uptime),
    version: process.env.npm_package_version || "1.0.0",
    environment: config.nodeEnv,
    database: {
      status: dbStatus,
      responseTime: dbResponseTime,
    },
    memory: {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: memoryPercentage,
    },
  };

  const statusCode = healthData.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthData);
};
