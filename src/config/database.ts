import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { config } from "./config";
import { logger } from "@/utils/logger";

class Database {
  private pool: Pool;
  private static instance: Database;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      ssl: config.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Handle pool errors
    this.pool.on("error", (err) => {
      logger.error("Unexpected error on idle client:", err);
    });

    // Handle pool connection
    this.pool.on("connect", () => {
      logger.debug("New client connected to the database");
    });

    // Handle pool disconnection
    this.pool.on("remove", () => {
      logger.debug("Client removed from the database pool");
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug("Executed query", { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error("Database query error:", { text, params, error });
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.query("SELECT NOW()");
      return true;
    } catch (error) {
      logger.error("Database connection test failed:", error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    logger.info("Database pool closed");
  }
}

export const db = Database.getInstance();

export const connectDB = async (): Promise<void> => {
  try {
    const isConnected = await db.testConnection();
    if (isConnected) {
      logger.info("✅ Database connected successfully");
    } else {
      throw new Error("Database connection test failed");
    }
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    throw error;
  }
};
