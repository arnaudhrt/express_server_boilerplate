import path from "path";
import { MigrationRunner } from "./migration";
import { db } from "./database";
import { logger } from "../utils/logger";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "up";
  const migrationName = args[1];

  try {
    // Set migrations directory relative to project root
    const migrationsDir = path.join(process.cwd(), "src/shared/database/migrations");
    const migrationRunner = new MigrationRunner(db, migrationsDir);

    switch (command) {
      case "up":
        logger.info("Running pending migrations...");
        await migrationRunner.runMigrations();
        break;

      case "down":
        logger.info("Rolling back last migration...");
        await migrationRunner.rollbackLast();
        break;

      case "status":
        await showMigrationStatus(migrationRunner);
        break;

      case "create":
        if (!migrationName) {
          logger.error("Migration name is required for create command");
          logger.info('Usage: pnpm run migrate create "migration_name"');
          process.exit(1);
        }
        const filename = await migrationRunner.createMigration(migrationName);
        logger.info(`Created migration: ${filename}`);
        break;

      default:
        logger.error(`Unknown command: ${command}`);
        logger.info("Available commands: up, down, status, create");
        process.exit(1);
    }
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

async function showMigrationStatus(migrationRunner: MigrationRunner) {
  try {
    await migrationRunner.ensureMigrationsTable();

    const executedMigrations = await migrationRunner.getExecutedMigrations();
    const migrationFiles = await migrationRunner.getMigrationFiles();

    const pendingMigrations = migrationFiles.filter((file) => !executedMigrations.includes(file));

    logger.info("\n=== Migration Status ===");

    if (executedMigrations.length > 0) {
      logger.info("\nExecuted migrations:");
      executedMigrations.forEach((migration) => {
        logger.info(`  ✓ ${migration}`);
      });
    } else {
      logger.info("\nNo executed migrations");
    }

    if (pendingMigrations.length > 0) {
      logger.info("\nPending migrations:");
      pendingMigrations.forEach((migration) => {
        logger.info(`  ○ ${migration}`);
      });
    } else {
      logger.info("\nNo pending migrations");
    }

    logger.info(`\nTotal: ${migrationFiles.length} migrations (${executedMigrations.length} executed, ${pendingMigrations.length} pending)`);
  } catch (error) {
    logger.error("Failed to get migration status:", error);
    throw error;
  }
}

// Handle uncaught errors
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  logger.error("Script failed:", error);
  process.exit(1);
});
