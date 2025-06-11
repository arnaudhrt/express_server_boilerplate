import { ErrorHandler } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import express from "express";

export const errorHandlerMiddleware = (err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const apiError = ErrorHandler.processError(err);

  logger.error(apiError.message, {
    statusCode: apiError.statusCode,
    isOperational: apiError.isOperational,
    stack: apiError.stack,
    path: req.path,
  });

  res.status(apiError.statusCode).json({
    message: apiError.isOperational ? apiError.message : "An unexpected internal server error occurred, check logs on the server for more details",
  });
};
