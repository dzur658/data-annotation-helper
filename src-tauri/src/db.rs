use rusqlite::Connection;

pub fn get_or_create_key() -> Result<String, Box<dyn std::error::Error>> {
    let entry = keyring::Entry::new("com.dzur658.data-annotation-helper", "db-encryption-key")?;
    match entry.get_password() {
        Ok(key) => Ok(key),
        Err(keyring::Error::NoEntry) => {
            let mut buf = [0u8; 32];
            getrandom::fill(&mut buf)?;
            let key = hex::encode(buf);
            entry.set_password(&key)?;
            Ok(key)
        }
        Err(e) => Err(Box::new(e)),
    }
}

pub fn open_encrypted(path: &std::path::Path) -> Result<Connection, Box<dyn std::error::Error>> {
    let conn = Connection::open(path)?;
    let key = get_or_create_key()?;

    // PRAGMA key MUST be the first thing executed on the connection
    conn.pragma_update(None, "key", &key)?;

    // Verify the key actually decrypts (wrong key fails lazily otherwise)
    conn.query_row("SELECT count(*) FROM sqlite_master", [], |_| Ok(()))?;

    Ok(conn)
}


// Initialize the database schema if it doesn't exist
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
         );"
    )
}