mod db;

use rusqlite::Connection;
use serde::Serialize;
use std::sync::Mutex;
use tauri::Manager;

pub struct Db(pub Mutex<Connection>);

#[derive(Serialize)]
pub struct Project {
    id: i64,
    name: String,
}

#[tauri::command]
fn add_project(state: tauri::State<Db>, name: String) -> Result<i64, String> {
    let conn = state.0.lock().unwrap();
    conn.execute("INSERT INTO projects (projectName) VALUES (?1)", [name])
        .map(|_| conn.last_insert_rowid())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn list_projects(state: tauri::State<Db>) -> Result<Vec<Project>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT projectId, projectName FROM projects ORDER BY projectId")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(rows)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      let dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&dir)?;

      // open connection
      let conn = db::open(&dir.join("app.db"))?;
      db::init(&conn)?;

      app.manage(Db(Mutex::new(conn)));
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![add_project, list_projects])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}