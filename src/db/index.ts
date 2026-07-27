import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function createDatabase(connectionString: string) {
  if (!connectionString.startsWith("postgres")) {
    throw new Error("DATABASE_URL must be a Neon Postgres connection string");
  }

  return drizzle(neon(connectionString), { schema });
}

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  return createDatabase(connectionString);
}
