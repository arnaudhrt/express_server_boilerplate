import { Database } from "./database";
import fs from "fs/promises";
import path from "path";
import { logger } from "../utils/logger";

export class MigrationRunner {
  private db: Database;
  private migrationsDir: string;

  constructor(db: Database, migrationsDir: string = "./migrations") {
    this.db = db;
    this.migrationsDir = migrationsDir;
  }

  async ensureMigrationsTable() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.db.query("SELECT filename FROM migrations ORDER BY id");
    return result.rows.map((row) => row.filename);
  }

  async getMigrationFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.migrationsDir);
      return files.filter((file) => file.endsWith(".sql")).sort();
    } catch (error) {
      logger.error(`Migrations directory ${this.migrationsDir} not found. Creating it...`);
      await fs.mkdir(this.migrationsDir, { recursive: true });
      return [];
    }
  }

  async runMigrations() {
    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = await this.getMigrationFiles();

    const pendingMigrations = migrationFiles.filter((file) => !executedMigrations.includes(file));

    if (pendingMigrations.length === 0) {
      logger.info("No pending migrations");
      return;
    }

    for (const filename of pendingMigrations) {
      logger.info(`Running migration: ${filename}`);

      const filePath = path.join(this.migrationsDir, filename);
      const content = await fs.readFile(filePath, "utf-8");

      // Split by -- ROLLBACK to separate up and down migrations
      const [upMigration] = content.split("-- ROLLBACK");

      await this.db.transaction(async (client) => {
        await client.query(upMigration.trim());
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [filename]);
      });

      logger.info(`Migration ${filename} completed`);
    }
  }

  async rollbackLast() {
    await this.ensureMigrationsTable();

    const result = await this.db.query("SELECT filename FROM migrations ORDER BY id DESC LIMIT 1");

    if (result.rows.length === 0) {
      logger.info("No migrations to rollback");
      return;
    }

    const filename = result.rows[0].filename;
    logger.info(`Rolling back migration: ${filename}`);

    const filePath = path.join(this.migrationsDir, filename);
    const content = await fs.readFile(filePath, "utf-8");

    // Get rollback part after -- ROLLBACK
    const parts = content.split("-- ROLLBACK");
    if (parts.length < 2) {
      throw new Error(`No rollback section found in ${filename}`);
    }

    const rollbackMigration = parts[1].trim();

    await this.db.transaction(async (client) => {
      await client.query(rollbackMigration);
      await client.query("DELETE FROM migrations WHERE filename = $1", [filename]);
    });

    logger.info(`Migration ${filename} rolled back`);
  }

  async createMigration(name: string) {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const filename = `${timestamp}_${name.replace(/\s+/g, "_")}.sql`;
    const filePath = path.join(this.migrationsDir, filename);

    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- UP
CREATE TABLE example (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROLLBACK
DROP TABLE example;
`;

    await fs.mkdir(this.migrationsDir, { recursive: true });
    await fs.writeFile(filePath, template);

    logger.info(`Migration created: ${filename}`);
    return filename;
  }
}
