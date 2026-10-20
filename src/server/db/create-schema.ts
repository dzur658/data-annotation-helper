import { client } from "./client"; // your createClient() singleton

const CREATE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS projects (
     projectId   INTEGER PRIMARY KEY AUTOINCREMENT,
     projectName TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS tasks (
     taskId    INTEGER PRIMARY KEY AUTOINCREMENT,
     projectId INTEGER NOT NULL REFERENCES projects(projectId) ON DELETE CASCADE,
     taskName  TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS responses (
     responseId    INTEGER PRIMARY KEY AUTOINCREMENT,
     taskId        INTEGER NOT NULL REFERENCES tasks(taskId) ON DELETE CASCADE,
     responseLabel TEXT NOT NULL,
     responseText  TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS flags (
     flagId         INTEGER PRIMARY KEY AUTOINCREMENT,
     responseId     INTEGER NOT NULL REFERENCES responses(responseId) ON DELETE CASCADE,
     sentenceText   TEXT NOT NULL,
     flagType       TEXT NOT NULL,
     flagResolution TEXT,
     reasoningNote  TEXT
   )`,
];

export async function createSchema(): Promise<void> {
  // SQLite doesn't enforce foreign keys unless this is enabled per-connection
  await client.execute("PRAGMA foreign_keys = ON;");

  for (const stmt of CREATE_STATEMENTS) {
    await client.execute(stmt);
  }
}