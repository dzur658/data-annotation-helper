
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { invoke } from "@tauri-apps/api/core";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

// fetches path from Rust backend
async function getDatabaseUrl(): Promise<string | null> {
  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
    return null;
  }

  const url = await invoke<string>("db_url");

  // console.log(`Database URL from Rust backend: ${url}`);
  return url;
}

// create the schema in the database if it doesn't exist

export const client = globalForDb.client ?? createClient({ url: await getDatabaseUrl() });