import { logger } from "./logger";

interface EnvValidation {
  key: string;
  required: boolean;
  type: "string" | "number" | "boolean";
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

const requiredEnvVars: EnvValidation[] = [
  {
    key: "DATABASE_URL",
    required: true,
    type: "string",
    validator: (value) => value.startsWith("postgresql://"),
    errorMessage: "DATABASE_URL must be a valid PostgreSQL connection string",
  },
  {
    key: "NODE_ENV",
    required: true,
    type: "string",
    validator: (value) => ["development", "production", "test"].includes(value),
    errorMessage: "NODE_ENV must be one of: development, production, test",
  },
  {
    key: "PORT",
    required: false,
    type: "number",
    validator: (value) => {
      const port = parseInt(value, 10);
      return port > 0 && port <= 65535;
    },
    errorMessage: "PORT must be a valid port number (1-65535)",
  },
];

export const validateEnv = (): void => {
  const errors: string[] = [];

  for (const env of requiredEnvVars) {
    const value = process.env[env.key];

    // Check if required variable is missing
    if (env.required && (!value || value.trim() === "")) {
      errors.push(`Missing required environment variable: ${env.key}`);
      continue;
    }

    // Skip validation if variable is not set and not required
    if (!value) continue;

    // Type validation
    if (env.type === "number" && isNaN(Number(value))) {
      errors.push(`Environment variable ${env.key} must be a number`);
      continue;
    }

    if (env.type === "boolean" && !["true", "false"].includes(value.toLowerCase())) {
      errors.push(`Environment variable ${env.key} must be 'true' or 'false'`);
      continue;
    }

    // Custom validation
    if (env.validator && !env.validator(value)) {
      errors.push(env.errorMessage || `Invalid value for environment variable: ${env.key}`);
    }
  }

  // Log warnings for production environment
  if (process.env.NODE_ENV === "production") {
    const warnings: string[] = [];

    if (!process.env.LOG_LEVEL) {
      warnings.push("LOG_LEVEL not set, using default: info");
    }

    warnings.forEach((warning) => logger.warn(warning));
  }

  if (errors.length > 0) {
    logger.error("Environment validation failed:");
    errors.forEach((error) => logger.error(`  - ${error}`));
    throw new Error("Environment validation failed. Please check your .env file.");
  }

  logger.info("✅ Environment variables validated successfully");
};
