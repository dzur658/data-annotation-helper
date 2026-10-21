use rusqlite::Connection;

pub fn open(path: &std::path::Path) -> rusqlite::Result<Connection> {
    Connection::open(path)
}

pub fn init(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         CREATE TABLE IF NOT EXISTS projects (
           projectId   INTEGER PRIMARY KEY AUTOINCREMENT,
           projectName TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS tasks (
           taskId    INTEGER PRIMARY KEY AUTOINCREMENT,
           projectId INTEGER NOT NULL REFERENCES projects(projectId) ON DELETE CASCADE,
           taskName  TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS responses (
           responseId    INTEGER PRIMARY KEY AUTOINCREMENT,
           taskId        INTEGER NOT NULL REFERENCES tasks(taskId) ON DELETE CASCADE,
           responseLabel TEXT NOT NULL,
           responseText  TEXT NOT NULL
         );
         CREATE TABLE IF NOT EXISTS flags (
           flagId         INTEGER PRIMARY KEY AUTOINCREMENT,
           responseId     INTEGER NOT NULL REFERENCES responses(responseId) ON DELETE CASCADE,
           sentenceText   TEXT NOT NULL,
           flagType       TEXT NOT NULL,
           flagResolution TEXT,
           reasoningNote  TEXT
         );",
    )
}